import uuid
from datetime import datetime, timezone

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    Boolean, DateTime, Enum, Float, ForeignKey,
    Integer, String, Text, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clerk_user_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(512))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    notes: Mapped[list["Note"]] = relationship("Note", back_populates="user")
    ai_conversations: Mapped[list["AIConversation"]] = relationship("AIConversation", back_populates="user")


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False, default="Untitled")
    content: Mapped[dict | None] = mapped_column(JSON)           # Tiptap rich text JSON
    content_plain: Mapped[str | None] = mapped_column(Text)      # searchable plain text
    note_type: Mapped[str] = mapped_column(
        Enum("meeting", "journal", "todo", "research", "general", name="note_type"),
        default="general",
    )
    is_private: Mapped[bool] = mapped_column(Boolean, default=False)
    folder_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("folders.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user: Mapped["User"] = relationship("User", back_populates="notes")
    versions: Mapped[list["NoteVersion"]] = relationship("NoteVersion", back_populates="note")
    note_tags: Mapped[list["NoteTag"]] = relationship("NoteTag", back_populates="note")
    embeddings: Mapped[list["Embedding"]] = relationship("Embedding", back_populates="note")
    outgoing_links: Mapped[list["NoteLink"]] = relationship(
        "NoteLink", foreign_keys="NoteLink.source_note_id", back_populates="source_note"
    )
    incoming_links: Mapped[list["NoteLink"]] = relationship(
        "NoteLink", foreign_keys="NoteLink.target_note_id", back_populates="target_note"
    )


class Folder(Base):
    __tablename__ = "folders"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    parent_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("folders.id"), nullable=True)

    notes: Mapped[list["Note"]] = relationship("Note", back_populates="folder")


Note.folder = relationship("Folder", back_populates="notes", foreign_keys=[Note.folder_id])


class NoteVersion(Base):
    __tablename__ = "note_versions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    note_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("notes.id"), nullable=False)
    content_snapshot: Mapped[dict | None] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    note: Mapped["Note"] = relationship("Note", back_populates="versions")


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    is_ai_generated: Mapped[bool] = mapped_column(Boolean, default=False)

    note_tags: Mapped[list["NoteTag"]] = relationship("NoteTag", back_populates="tag")


class NoteTag(Base):
    __tablename__ = "note_tags"

    note_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("notes.id"), primary_key=True)
    tag_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tags.id"), primary_key=True)

    note: Mapped["Note"] = relationship("Note", back_populates="note_tags")
    tag: Mapped["Tag"] = relationship("Tag", back_populates="note_tags")


class NoteLink(Base):
    __tablename__ = "note_links"

    source_note_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("notes.id"), primary_key=True)
    target_note_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("notes.id"), primary_key=True)
    link_type: Mapped[str] = mapped_column(
        Enum("manual", "ai_suggested", name="link_type"), default="manual"
    )
    strength: Mapped[float | None] = mapped_column(Float)

    source_note: Mapped["Note"] = relationship("Note", foreign_keys=[source_note_id], back_populates="outgoing_links")
    target_note: Mapped["Note"] = relationship("Note", foreign_keys=[target_note_id], back_populates="incoming_links")


class Embedding(Base):
    __tablename__ = "embeddings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    note_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("notes.id"), nullable=False)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[list] = mapped_column(Vector(384), nullable=True)

    note: Mapped["Note"] = relationship("Note", back_populates="embeddings")


class Notebook(Base):
    __tablename__ = "notebooks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    members: Mapped[list["NotebookMember"]] = relationship("NotebookMember", back_populates="notebook")


class NotebookMember(Base):
    __tablename__ = "notebook_members"

    notebook_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("notebooks.id"), primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    role: Mapped[str] = mapped_column(
        Enum("viewer", "commenter", "editor", "admin", name="member_role"), default="viewer"
    )

    notebook: Mapped["Notebook"] = relationship("Notebook", back_populates="members")


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    messages: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship("User", back_populates="ai_conversations")
