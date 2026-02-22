from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.models import Notebook, NotebookMember, User
from app.schemas.schemas import InviteRequest

router = APIRouter(prefix="/api/notebooks", tags=["notebooks"])


@router.post("/{notebook_id}/invite")
def invite(
    notebook_id: UUID,
    body: InviteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notebook = db.query(Notebook).filter(Notebook.id == notebook_id, Notebook.owner_id == current_user.id).first()
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")

    invitee = db.query(User).filter(User.email == body.email).first()
    if not invitee:
        raise HTTPException(status_code=404, detail="User not found")

    member = NotebookMember(notebook_id=notebook_id, user_id=invitee.id, role=body.role)
    db.add(member)
    db.commit()
    return {"detail": "Invited successfully"}


@router.get("/{notebook_id}/members")
def list_members(
    notebook_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    members = db.query(NotebookMember).filter(NotebookMember.notebook_id == notebook_id).all()
    return [{"user_id": m.user_id, "role": m.role} for m in members]
