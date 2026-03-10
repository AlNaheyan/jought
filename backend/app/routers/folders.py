from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.models import Folder, Note, User
from app.schemas.schemas import FolderCreate, FolderOut, FolderUpdate

router = APIRouter(prefix="/api/folders", tags=["folders"])


@router.get("", response_model=list[FolderOut])
def list_folders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Folder)
        .filter(Folder.user_id == current_user.id)
        .order_by(Folder.name)
        .all()
    )


@router.post("", response_model=FolderOut, status_code=status.HTTP_201_CREATED)
def create_folder(
    body: FolderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.parent_id is not None:
        parent = db.query(Folder).filter(
            Folder.id == body.parent_id,
            Folder.user_id == current_user.id,
        ).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent folder not found")

    folder = Folder(
        user_id=current_user.id,
        name=body.name,
        parent_id=body.parent_id,
    )
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return folder


@router.put("/{folder_id}", response_model=FolderOut)
def rename_folder(
    folder_id: UUID,
    body: FolderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    folder = _get_or_404(folder_id, current_user.id, db)
    folder.name = body.name
    db.commit()
    db.refresh(folder)
    return folder


@router.delete("/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_folder(
    folder_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    folder = _get_or_404(folder_id, current_user.id, db)

    # Detach all notes in this folder before deleting
    db.query(Note).filter(Note.folder_id == folder_id).update(
        {Note.folder_id: None}, synchronize_session=False
    )

    # Re-parent child folders to this folder's parent (or root)
    db.query(Folder).filter(
        Folder.parent_id == folder_id,
        Folder.user_id == current_user.id,
    ).update({Folder.parent_id: folder.parent_id}, synchronize_session=False)

    db.delete(folder)
    db.commit()


# ── Helpers ───────────────────────────────────────────────────────────────

def _get_or_404(folder_id: UUID, user_id: UUID, db: Session) -> Folder:
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.user_id == user_id,
    ).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    return folder
