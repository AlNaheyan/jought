from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.models.models import User

router = APIRouter(prefix="/api/insights", tags=["insights"])


@router.get("/sentiment")
def sentiment(current_user: User = Depends(get_current_user)):
    # TODO Phase 2: sentiment analysis pipeline
    return {"data": []}


@router.get("/activity")
def activity(current_user: User = Depends(get_current_user)):
    # TODO Phase 2: writing frequency heatmap data
    return {"data": []}


@router.get("/summary")
def summary(current_user: User = Depends(get_current_user)):
    # TODO Phase 2: weekly AI-generated summary
    return {"summary": ""}
