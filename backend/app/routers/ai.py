from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.models.models import User
from app.schemas.schemas import (
    AskRequest, AskResponse,
    ExpandRequest, ExpandResponse,
    RewriteRequest, RewriteResponse,
    SummarizeRequest, SummarizeResponse,
)

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/ask", response_model=AskResponse)
async def ask(body: AskRequest, current_user: User = Depends(get_current_user)):
    # TODO Phase 1: wire up RAG service
    raise NotImplementedError("RAG service not yet implemented")


@router.post("/summarize", response_model=SummarizeResponse)
async def summarize(body: SummarizeRequest, current_user: User = Depends(get_current_user)):
    raise NotImplementedError


@router.post("/expand", response_model=ExpandResponse)
async def expand(body: ExpandRequest, current_user: User = Depends(get_current_user)):
    raise NotImplementedError


@router.post("/rewrite", response_model=RewriteResponse)
async def rewrite(body: RewriteRequest, current_user: User = Depends(get_current_user)):
    raise NotImplementedError


@router.post("/autotag")
async def autotag(note_id: str, current_user: User = Depends(get_current_user)):
    raise NotImplementedError


@router.post("/extract-actions")
async def extract_actions(note_id: str, current_user: User = Depends(get_current_user)):
    raise NotImplementedError
