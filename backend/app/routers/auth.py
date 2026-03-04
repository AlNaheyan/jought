from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.models.models import User
from app.schemas.schemas import UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user (auto-provisioned on first call)."""
    return current_user
