"""RAG pipeline: embed notes on save, similarity search on query."""

from uuid import UUID

from openai import AsyncOpenAI
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.models import Embedding, Note

CHAT_MODEL = "openai/gpt-oss-120b:free"
# OpenRouter does not support embeddings — using sentence-transformers locally instead.
# See embed_note() below.
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50

_chat_client: AsyncOpenAI | None = None


def _get_chat_client() -> AsyncOpenAI:
    global _chat_client
    if _chat_client is None:
        _chat_client = AsyncOpenAI(
            api_key=settings.OPENROUTER_API_KEY,
            base_url="https://openrouter.ai/api/v1",
            timeout=60,
        )
    return _chat_client


def _chunk_text(text: str) -> list[str]:
    chunks, start = [], 0
    while start < len(text):
        chunks.append(text[start : start + CHUNK_SIZE])
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks


def _get_embedding_model():
    """Lazy-load sentence-transformers (free, runs locally, no API key needed)."""
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer("all-MiniLM-L6-v2")


async def embed_note(db: Session, note: Note) -> None:
    """Chunk + embed note content locally, persist metadata to DB."""
    if not note.content_plain:
        return

    db.query(Embedding).filter(Embedding.note_id == note.id).delete()

    chunks = _chunk_text(note.content_plain)
    if not chunks:
        return

    model = _get_embedding_model()
    vectors = model.encode(chunks).tolist()

    for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
        db.add(Embedding(note_id=note.id, chunk_index=i, chunk_text=chunk))
        # TODO: upsert vector to ChromaDB / Pinecone with id=f"{note.id}_{i}"

    db.commit()


async def query(
    db: Session,
    user_id: UUID,
    question: str,
    top_k: int = 5,
) -> tuple[str, list[UUID]]:
    """Embed question → similarity search → DeepSeek R1 answer with citations."""
    # 1. Embed the question locally
    model = _get_embedding_model()
    # q_vector = model.encode([question])[0].tolist()
    # TODO: query ChromaDB / Pinecone with q_vector filtered by user_id

    # 2. Retrieve top-k notes (placeholder until vector DB is wired)
    notes = (
        db.query(Note)
        .filter(Note.user_id == user_id, Note.is_private.is_(False))
        .order_by(Note.updated_at.desc())
        .limit(top_k)
        .all()
    )

    context = "\n\n---\n\n".join(
        f"[Note: {n.title}]\n{n.content_plain or ''}" for n in notes
    )
    source_ids = [n.id for n in notes]

    # 3. Generate answer with DeepSeek R1
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

    return response.choices[0].message.content.strip(), source_ids
