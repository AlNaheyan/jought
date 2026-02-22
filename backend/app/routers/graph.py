from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.models import Note, NoteLink, User
from app.schemas.schemas import GraphEdge, GraphNode, GraphOut

router = APIRouter(prefix="/api/graph", tags=["graph"])


@router.get("", response_model=GraphOut)
def get_graph(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notes = db.query(Note).filter(Note.user_id == current_user.id).all()
    note_ids = {n.id for n in notes}

    links = db.query(NoteLink).filter(NoteLink.source_note_id.in_(note_ids)).all()

    nodes = [GraphNode(id=n.id, title=n.title, note_type=n.note_type) for n in notes]
    edges = [
        GraphEdge(source=lnk.source_note_id, target=lnk.target_note_id, link_type=lnk.link_type, strength=lnk.strength)
        for lnk in links
    ]
    return GraphOut(nodes=nodes, edges=edges)


@router.get("/clusters")
def get_clusters(current_user: User = Depends(get_current_user)):
    # TODO Phase 2: AI cluster detection
    return {"clusters": []}
