from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.models import Notebook, NotebookMember, User
from app.schemas.schemas import InviteRequest, NotebookCreate, NotebookOut, NotebookUpdate

router = APIRouter(prefix="/api/notebooks", tags=["notebooks"])


# ── CRUD ──────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[dict])
def list_notebooks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    owned = db.query(Notebook).filter(Notebook.owner_id == current_user.id).all()
    owned_ids = {nb.id for nb in owned}
    result = [
        {"id": nb.id, "name": nb.name, "owner_id": nb.owner_id, "role": "owner"}
        for nb in owned
    ]

    memberships = (
        db.query(NotebookMember)
        .filter(NotebookMember.user_id == current_user.id)
        .all()
    )
    for m in memberships:
        if m.notebook_id not in owned_ids:
            notebook = db.query(Notebook).filter(Notebook.id == m.notebook_id).first()
            if notebook:
                result.append(
                    {"id": notebook.id, "name": notebook.name, "owner_id": notebook.owner_id, "role": m.role}
                )

    return result


@router.post("", response_model=NotebookOut, status_code=201)
def create_notebook(
    body: NotebookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notebook = Notebook(name=body.name, owner_id=current_user.id)
    db.add(notebook)
    db.commit()
    db.refresh(notebook)
    return notebook


@router.put("/{notebook_id}", response_model=NotebookOut)
def update_notebook(
    notebook_id: UUID,
    body: NotebookUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notebook = db.query(Notebook).filter(Notebook.id == notebook_id).first()
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    if notebook.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the owner can rename this notebook")

    notebook.name = body.name
    db.commit()
    db.refresh(notebook)
    return notebook


@router.delete("/{notebook_id}", status_code=204)
def delete_notebook(
    notebook_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notebook = db.query(Notebook).filter(Notebook.id == notebook_id).first()
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    if notebook.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the owner can delete this notebook")

    db.query(NotebookMember).filter(NotebookMember.notebook_id == notebook_id).delete()
    db.delete(notebook)
    db.commit()
    return Response(status_code=204)


# ── Membership ────────────────────────────────────────────────────────────────

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

    existing = db.query(NotebookMember).filter(
        NotebookMember.notebook_id == notebook_id,
        NotebookMember.user_id == invitee.id,
    ).first()
    if existing:
        existing.role = body.role
        db.commit()
        return {"detail": "Member role updated"}

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
    # Verify the user is the owner or a member before listing
    notebook = db.query(Notebook).filter(Notebook.id == notebook_id).first()
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    is_member = (
        notebook.owner_id == current_user.id
        or db.query(NotebookMember).filter(
            NotebookMember.notebook_id == notebook_id,
            NotebookMember.user_id == current_user.id,
        ).first()
    )
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this notebook")

    members = db.query(NotebookMember).filter(NotebookMember.notebook_id == notebook_id).all()
    return [{"user_id": m.user_id, "role": m.role} for m in members]
