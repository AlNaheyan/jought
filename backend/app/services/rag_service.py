"""RAG pipeline: embed notes on save, similarity search on query."""

from uuid import UUID

import chromadb
from openai import AsyncOpenAI
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.models import Embedding, Note

CHAT_MODEL = "openai/gpt-oss-120b:free"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
COLLECTION_NAME = "jought_notes"

_chat_client: AsyncOpenAI | None = None
_chroma_client: chromadb.HttpClient | None = None
_collection = None


def _get_chat_client() -> AsyncOpenAI:
    global _chat_client
    if _chat_client is None:
        _chat_client = AsyncOpenAI(
            api_key=settings.OPENROUTER_API_KEY,
            base_url="https://openrouter.ai/api/v1",
            timeout=60,
        )
    return _chat_client


def _get_collection():
    """Lazy-init ChromaDB HTTP client and get (or create) the collection."""
    global _chroma_client, _collection
    if _collection is None:
        _chroma_client = chromadb.HttpClient(host=settings.CHROMA_HOST, port=settings.CHROMA_PORT)
        _collection = _chroma_client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
    return _collection


def _get_embedding_model():
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer("all-MiniLM-L6-v2")


def _chunk_text(text: str) -> list[str]:
    chunks, start = [], 0
    while start < len(text):
        chunks.append(text[start : start + CHUNK_SIZE])
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks


async def embed_note(db: Session, note: Note) -> None:
    """Chunk + embed note, store vectors in ChromaDB, metadata in Postgres."""
    if not note.content_plain:
        return

    # Remove old embeddings from both stores
    db.query(Embedding).filter(Embedding.note_id == note.id).delete()
    collection = _get_collection()
    # Delete any existing chunks for this note
    existing = collection.get(where={"note_id": str(note.id)})
    if existing["ids"]:
        collection.delete(ids=existing["ids"])

    chunks = _chunk_text(note.content_plain)
    if not chunks:
        db.commit()
        return

    model = _get_embedding_model()
    vectors = model.encode(chunks).tolist()

    # Upsert into ChromaDB
    ids = [f"{note.id}_{i}" for i in range(len(chunks))]
    collection.upsert(
        ids=ids,
        embeddings=vectors,
        documents=chunks,
        metadatas=[
            {"user_id": str(note.user_id), "note_id": str(note.id), "chunk_index": i}
            for i in range(len(chunks))
        ],
    )

    # Store chunk metadata in Postgres
    for i, chunk in enumerate(chunks):
        db.add(Embedding(note_id=note.id, chunk_index=i, chunk_text=chunk))

    db.commit()


async def query(
    db: Session,
    user_id: UUID,
    question: str,
    top_k: int = 5,
) -> tuple[str, list[UUID]]:
    """Embed question → ChromaDB similarity search → LLM answer with citations."""
    # 1. Embed the question
    model = _get_embedding_model()
    q_vector = model.encode([question])[0].tolist()

    # 2. Similarity search in ChromaDB, filtered to this user's notes
    collection = _get_collection()
    results = collection.query(
        query_embeddings=[q_vector],
        n_results=top_k,
        where={"user_id": str(user_id)},
        include=["documents", "metadatas", "distances"],
    )

    # 3. Build context from retrieved chunks
    source_note_ids: list[UUID] = []
    context_parts: list[str] = []

    if results["ids"] and results["ids"][0]:
        seen_note_ids: set[str] = set()
        for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
            note_id_str = meta["note_id"]
            if note_id_str not in seen_note_ids:
                seen_note_ids.add(note_id_str)
                note = db.query(Note).filter(Note.id == note_id_str).first()
                title = note.title if note else "Untitled"
                source_note_ids.append(UUID(note_id_str))
            else:
                title = "..."
            context_parts.append(f"[Note: {title}]\n{doc}")

    if not context_parts:
        # Fallback: no embeddings yet, use recent notes
        notes = (
            db.query(Note)
            .filter(Note.user_id == user_id, Note.is_private.is_(False))
            .order_by(Note.updated_at.desc())
            .limit(top_k)
            .all()
        )
        context_parts = [f"[Note: {n.title}]\n{n.content_plain or ''}" for n in notes]
        source_note_ids = [n.id for n in notes]

    context = "\n\n---\n\n".join(context_parts)

    # 4. Generate answer
    response = await _get_chat_client().chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a helpful assistant answering questions based solely on the user's notes. "
                    "Cite which note each piece of information comes from."
                ),
            },
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"},
        ],
        max_tokens=600,
    )

    return response.choices[0].message.content.strip(), source_note_ids
