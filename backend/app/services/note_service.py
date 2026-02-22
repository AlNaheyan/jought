"""Business logic for note operations."""

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.models import Note, NoteVersion, Tag, NoteTag
from app.schemas.schemas import NoteCreate, NoteUpdate


def create_note(db: Session, user_id: UUID, data: NoteCreate) -> Note:
    note = Note(**data.model_dump(), user_id=user_id)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def update_note(db: Session, note: Note, data: NoteUpdate) -> Note:
    # Snapshot current content before applying update
    db.add(NoteVersion(note_id=note.id, content_snapshot=note.content))

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(note, field, value)

    db.commit()
    db.refresh(note)
    return note


def apply_tags(db: Session, note: Note, tag_names: list[str], ai_generated: bool = False) -> None:
    """Upsert tags and attach them to the note."""
    for name in tag_names:
        name = name.lower().strip()
        tag = db.query(Tag).filter(Tag.name == name).first()
        if not tag:
            tag = Tag(name=name, is_ai_generated=ai_generated)
            db.add(tag)
            db.flush()

        exists = db.query(NoteTag).filter(
            NoteTag.note_id == note.id, NoteTag.tag_id == tag.id
        ).first()
        if not exists:
            db.add(NoteTag(note_id=note.id, tag_id=tag.id))

    db.commit()
