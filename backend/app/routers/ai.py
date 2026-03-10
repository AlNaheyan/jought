import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.models import AIConversation, Note, User
from app.schemas.schemas import (
    AskRequest, AskResponse,
    ExpandRequest, ExpandResponse,
    RewriteRequest, RewriteResponse,
    SummarizeRequest, SummarizeResponse,
)
from openai import RateLimitError

from app.services import ai_service, rag_service

router = APIRouter(prefix="/api/ai", tags=["ai"])
limiter = Limiter(key_func=get_remote_address)


def _handle_openai_error(e: Exception) -> None:
    if isinstance(e, RateLimitError):
        raise HTTPException(status_code=429, detail="AI provider rate limit reached. Try again later or add credits to your OpenRouter account.")
    raise HTTPException(status_code=502, detail="AI provider error. Please try again.")


@router.post("/ask", response_model=AskResponse)
@limiter.limit("20/minute")
async def ask(
    request: Request,
    body: AskRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        answer, source_ids = await rag_service.query(db, current_user.id, body.question)
    except Exception as e:
        _handle_openai_error(e)

    conv_id = body.conversation_id or uuid.uuid4()
    conv = db.query(AIConversation).filter(AIConversation.id == conv_id).first()
    if conv:
        conv.messages.append({"role": "user", "content": body.question})
        conv.messages.append({"role": "assistant", "content": answer})
    else:
        conv = AIConversation(
            id=conv_id,
            user_id=current_user.id,
            messages=[
                {"role": "user", "content": body.question},
                {"role": "assistant", "content": answer},
            ],
        )
        db.add(conv)
    db.commit()

    return AskResponse(answer=answer, source_note_ids=source_ids, conversation_id=conv_id)


@router.post("/summarize", response_model=SummarizeResponse)
@limiter.limit("30/minute")
async def summarize(
    request: Request,
    body: SummarizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = db.query(Note).filter(Note.id == body.note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    try:
        summary = await ai_service.summarize(note.content_plain or "")
    except Exception as e:
        _handle_openai_error(e)
    return SummarizeResponse(summary=summary)


@router.post("/expand", response_model=ExpandResponse)
@limiter.limit("30/minute")
async def expand(
    request: Request,
    body: ExpandRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        return ExpandResponse(expanded=await ai_service.expand(body.text))
    except Exception as e:
        _handle_openai_error(e)


@router.post("/rewrite", response_model=RewriteResponse)
@limiter.limit("30/minute")
async def rewrite(
    request: Request,
    body: RewriteRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        return RewriteResponse(rewritten=await ai_service.rewrite(body.text, body.tone))
    except Exception as e:
        _handle_openai_error(e)


@router.post("/autotag")
@limiter.limit("60/minute")
async def autotag(
    request: Request,
    note_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    tags = await ai_service.autotag(note.content_plain or "")
    from app.services.note_service import apply_tags
    apply_tags(db, note, tags, ai_generated=True)
    return {"tags": tags}


@router.post("/extract-actions")
@limiter.limit("30/minute")
async def extract_actions(
    request: Request,
    note_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    actions = await ai_service.extract_actions(note.content_plain or "")
    return {"actions": actions}
