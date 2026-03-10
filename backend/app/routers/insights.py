from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.models import Note, User, WeeklySummary
from app.schemas.schemas import ActivityPoint, InsightsSummaryOut, InsightsStats, SentimentPoint

router = APIRouter(prefix="/api/insights", tags=["insights"])


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _current_week_start() -> datetime:
    """Return Monday 00:00 UTC of the current week."""
    now = _utcnow()
    monday = now - timedelta(days=now.weekday())
    return monday.replace(hour=0, minute=0, second=0, microsecond=0)


@router.get("/activity", response_model=list[ActivityPoint])
def activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    since = _utcnow() - timedelta(days=91)
    rows = (
        db.query(func.date(Note.updated_at).label("day"), func.count().label("cnt"))
        .filter(Note.user_id == current_user.id, Note.updated_at >= since)
        .group_by(func.date(Note.updated_at))
        .all()
    )
    return [ActivityPoint(date=str(row.day), count=row.cnt) for row in rows]


@router.get("/sentiment", response_model=list[SentimentPoint])
def sentiment(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(Note)
        .filter(Note.user_id == current_user.id, Note.sentiment_score.isnot(None))
        .order_by(Note.updated_at.desc())
        .limit(60)
        .all()
    )
    return [
        SentimentPoint(
            date=note.updated_at.strftime("%Y-%m-%d"),
            score=note.sentiment_score,
            title=note.title,
        )
        for note in reversed(rows)
    ]


@router.get("/summary", response_model=InsightsSummaryOut)
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the stored weekly summary for the current week, if any."""
    week_start = _current_week_start()
    existing = (
        db.query(WeeklySummary)
        .filter(
            WeeklySummary.user_id == current_user.id,
            WeeklySummary.week_start == week_start,
        )
        .first()
    )
    if existing:
        return InsightsSummaryOut(summary=existing.summary, generated_at=existing.updated_at)
    return InsightsSummaryOut(summary="", generated_at=None)


@router.post("/summary", response_model=InsightsSummaryOut)
async def generate_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate (or regenerate) the weekly summary for the current week."""
    from app.services import ai_service

    week_start = _current_week_start()
    since = week_start

    notes = (
        db.query(Note)
        .filter(Note.user_id == current_user.id, Note.updated_at >= since)
        .order_by(Note.updated_at.desc())
        .limit(20)
        .all()
    )
    if not notes:
        return InsightsSummaryOut(summary="No notes written this week.", generated_at=_utcnow())

    notes_text = "\n\n---\n\n".join(
        f"Title: {n.title}\n{n.content_plain or ''}" for n in notes
    )
    result = await ai_service.weekly_summary(notes_text)

    # Upsert the stored summary
    existing = (
        db.query(WeeklySummary)
        .filter(
            WeeklySummary.user_id == current_user.id,
            WeeklySummary.week_start == week_start,
        )
        .first()
    )
    if existing:
        existing.summary = result
        db.commit()
        db.refresh(existing)
        return InsightsSummaryOut(summary=existing.summary, generated_at=existing.updated_at)

    ws = WeeklySummary(user_id=current_user.id, week_start=week_start, summary=result)
    db.add(ws)
    db.commit()
    db.refresh(ws)
    return InsightsSummaryOut(summary=ws.summary, generated_at=ws.updated_at)


@router.get("/stats", response_model=InsightsStats)
def stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    since = _utcnow() - timedelta(days=7)
    base = db.query(Note).filter(Note.user_id == current_user.id)

    total_notes = base.count()
    notes_this_week = base.filter(Note.updated_at >= since).count()

    top_row = (
        base.with_entities(Note.note_type, func.count().label("cnt"))
        .group_by(Note.note_type)
        .order_by(func.count().desc())
        .first()
    )
    top_note_type = top_row[0] if top_row else "general"

    word_sum = base.with_entities(
        func.coalesce(func.sum(func.length(Note.content_plain) - func.length(func.replace(Note.content_plain, " ", "")) + 1), 0)
    ).scalar()
    total_words = max(int(word_sum), 0) if word_sum else 0

    return InsightsStats(
        total_notes=total_notes,
        notes_this_week=notes_this_week,
        top_note_type=top_note_type,
        total_words=total_words,
    )
