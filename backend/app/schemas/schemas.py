from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, EmailStr, Field, field_validator


# ── User ─────────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    email: str
    name: str
    avatar_url: str | None
    created_at: datetime


# ── Notes ─────────────────────────────────────────────────────────────────

NoteType = Literal["meeting", "journal", "todo", "research", "general"]


class NoteCreate(BaseModel):
    title: str = Field(default="Untitled", max_length=500)
    content: dict[str, Any] | None = None
    content_plain: str | None = Field(default=None, max_length=200_000)
    note_type: NoteType = "general"
    is_private: bool = False
    folder_id: uuid.UUID | None = None

    @field_validator("title")
    @classmethod
    def strip_title(cls, v: str) -> str:
        stripped = v.strip()
        return stripped if stripped else "Untitled"


class NoteUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=500)
    content: dict[str, Any] | None = None
    content_plain: str | None = Field(default=None, max_length=200_000)
    note_type: NoteType | None = None
    is_private: bool | None = None
    folder_id: uuid.UUID | None = None

    @field_validator("title")
    @classmethod
    def strip_title(cls, v: str | None) -> str | None:
        if v is None:
            return v
        stripped = v.strip()
        return stripped if stripped else "Untitled"


class NoteOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    title: str
    content: dict[str, Any] | None
    content_plain: str | None
    note_type: str
    is_private: bool
    folder_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime


class NoteListOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    title: str
    note_type: str
    is_private: bool
    created_at: datetime
    updated_at: datetime


# ── Tags ─────────────────────────────────────────────────────────────────

class TagOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    name: str
    is_ai_generated: bool


# ── AI ────────────────────────────────────────────────────────────────────

class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2_000)
    conversation_id: uuid.UUID | None = None

    @field_validator("question")
    @classmethod
    def strip_question(cls, v: str) -> str:
        return v.strip()


class AskResponse(BaseModel):
    answer: str
    source_note_ids: list[uuid.UUID]
    conversation_id: uuid.UUID


class SummarizeRequest(BaseModel):
    note_id: uuid.UUID


class SummarizeResponse(BaseModel):
    summary: str


class ExpandRequest(BaseModel):
    text: str = Field(min_length=1, max_length=10_000)


class ExpandResponse(BaseModel):
    expanded: str


RewriteTone = Literal["formal", "casual", "concise", "creative"]


class RewriteRequest(BaseModel):
    text: str = Field(min_length=1, max_length=10_000)
    tone: RewriteTone = "formal"


class RewriteResponse(BaseModel):
    rewritten: str


# ── Graph ─────────────────────────────────────────────────────────────────

class GraphNode(BaseModel):
    id: uuid.UUID
    title: str
    note_type: str


class GraphEdge(BaseModel):
    source: uuid.UUID
    target: uuid.UUID
    link_type: str
    strength: float | None


class GraphOut(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]


# ── Notebooks ─────────────────────────────────────────────────────────────

class InviteRequest(BaseModel):
    email: EmailStr
    role: Literal["viewer", "commenter", "editor", "admin"] = "viewer"
