from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.models import Note, NoteVersion, User
from app.schemas.schemas import NoteCreate, NoteListOut, NoteOut, NoteUpdate

router = APIRouter(prefix="/api/notes", tags=["notes"])


@router.get("", response_model=list[NoteListOut])
def list_notes(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    note_type: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Note).filter(Note.user_id == current_user.id)
    if note_type:
        q = q.filter(Note.note_type == note_type)
    return q.order_by(Note.updated_at.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
def create_note(
    body: NoteCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = Note(**body.model_dump(), user_id=current_user.id)
    db.add(note)
    db.commit()
    db.refresh(note)

    # AI tasks run async — never block the save response
    background_tasks.add_task(_autotag_and_embed, note.id)

    return note


@router.get("/{note_id}", response_model=NoteOut)
def get_note(note_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _get_or_404(note_id, current_user.id, db)


@router.put("/{note_id}", response_model=NoteOut)
def update_note(
    note_id: UUID,
    body: NoteUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = _get_or_404(note_id, current_user.id, db)

    # Save version snapshot before updating
    db.add(NoteVersion(note_id=note.id, content_snapshot=note.content))

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(note, field, value)

    db.commit()
    db.refresh(note)
    background_tasks.add_task(_autotag_and_embed, note.id)
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    note = _get_or_404(note_id, current_user.id, db)
    db.delete(note)
    db.commit()


@router.get("/{note_id}/versions")
def get_versions(note_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _get_or_404(note_id, current_user.id, db)
    versions = db.query(NoteVersion).filter(NoteVersion.note_id == note_id).order_by(NoteVersion.created_at.desc()).all()
    return versions


@router.get("/{note_id}/backlinks")
def get_backlinks(note_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.models import NoteLink
    note = _get_or_404(note_id, current_user.id, db)
    links = db.query(NoteLink).filter(NoteLink.target_note_id == note_id).all()
    return [{"source_note_id": lnk.source_note_id, "link_type": lnk.link_type} for lnk in links]


@router.get("/{note_id}/related")
def get_related(note_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.models import NoteLink
    _get_or_404(note_id, current_user.id, db)
    links = db.query(NoteLink).filter(NoteLink.source_note_id == note_id).all()
    return [{"target_note_id": lnk.target_note_id, "link_type": lnk.link_type, "strength": lnk.strength} for lnk in links]


# ── Helpers ───────────────────────────────────────────────────────────────

def _get_or_404(note_id: UUID, user_id: UUID, db: Session) -> Note:
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == user_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


async def _autotag_and_embed(note_id: UUID):
    """Placeholder — wire up AI service in Phase 1."""
    pass
