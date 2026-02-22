import uuid

from fastapi import APIRouter, Depends, HTTPException
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
from app.services import ai_service, rag_service

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/ask", response_model=AskResponse)
async def ask(
    body: AskRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    answer, source_ids = await rag_service.query(db, current_user.id, body.question)

    # Persist or continue conversation
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
async def summarize(
    body: SummarizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = db.query(Note).filter(Note.id == body.note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    summary = await ai_service.summarize(note.content_plain or "")
    return SummarizeResponse(summary=summary)


@router.post("/expand", response_model=ExpandResponse)
async def expand(body: ExpandRequest, current_user: User = Depends(get_current_user)):
    return ExpandResponse(expanded=await ai_service.expand(body.text))


@router.post("/rewrite", response_model=RewriteResponse)
async def rewrite(body: RewriteRequest, current_user: User = Depends(get_current_user)):
    return RewriteResponse(rewritten=await ai_service.rewrite(body.text, body.tone))


@router.post("/autotag")
async def autotag(
    note_id: str,
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
async def extract_actions(
    note_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    actions = await ai_service.extract_actions(note.content_plain or "")
    return {"actions": actions}
