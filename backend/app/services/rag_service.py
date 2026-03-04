"""RAG pipeline: embed notes on save, similarity search via pgvector."""

from uuid import UUID

from openai import AsyncOpenAI
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.models import Embedding, Note

CHAT_MODEL = "openai/gpt-oss-120b:free"
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
    """Chunk + embed note content, store vectors in Postgres via pgvector."""
    if not note.content_plain:
        return

    db.query(Embedding).filter(Embedding.note_id == note.id).delete()

    chunks = _chunk_text(note.content_plain)
    if not chunks:
        db.commit()
        return

    model = _get_embedding_model()
    vectors = model.encode(chunks).tolist()

    for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
        db.add(Embedding(
            note_id=note.id,
            chunk_index=i,
            chunk_text=chunk,
            embedding=vector,
        ))

    db.commit()


async def query(
    db: Session,
    user_id: UUID,
    question: str,
    top_k: int = 5,
) -> tuple[str, list[UUID]]:
    """Embed question → pgvector cosine similarity search → LLM answer with citations."""
    # 1. Embed the question
    model = _get_embedding_model()
    q_vector = model.encode([question])[0].tolist()

    # 2. Cosine similarity search — only chunks belonging to this user's notes
    results = (
        db.query(Embedding)
        .join(Note, Embedding.note_id == Note.id)
        .filter(Note.user_id == user_id, Note.is_private.is_(False))
        .filter(Embedding.embedding.isnot(None))
        .order_by(Embedding.embedding.cosine_distance(q_vector))
        .limit(top_k)
        .all()
    )

    # 3. Build context from top chunks
    if results:
        seen: set[UUID] = set()
        context_parts: list[str] = []
        source_note_ids: list[UUID] = []

        for emb in results:
            note = db.get(Note, emb.note_id)
            title = note.title if note else "Untitled"
            context_parts.append(f"[Note: {title}]\n{emb.chunk_text}")
            if emb.note_id not in seen:
                seen.add(emb.note_id)
                source_note_ids.append(emb.note_id)
    else:
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
                    "You are a retrieval assistant. Your ONLY source of information is the notes provided below. "
                    "Do NOT use any knowledge from your training data. "
                    "If the answer cannot be found in the provided notes, say: "
                    "'I couldn't find anything about that in your notes.' "
                    "When answering, cite which note the information comes from using [Note: title]."
                ),
            },
            {"role": "user", "content": f"Notes:\n{context}\n\nQuestion: {question}"},
        ],
        max_tokens=600,
    )

    return response.choices[0].message.content.strip(), source_note_ids
