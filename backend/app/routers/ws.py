"""WebSocket endpoint for real-time note co-editing."""

import json
from collections import defaultdict
from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["websocket"])

# note_id → set of active WebSocket connections
_rooms: dict[str, set[WebSocket]] = defaultdict(set)


@router.websocket("/ws/note/{note_id}")
async def note_ws(websocket: WebSocket, note_id: str):
    await websocket.accept()
    _rooms[note_id].add(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Broadcast operation to all other clients in the same room
            await _broadcast(note_id, data, sender=websocket)
    except WebSocketDisconnect:
        _rooms[note_id].discard(websocket)
        if not _rooms[note_id]:
            del _rooms[note_id]


async def _broadcast(note_id: str, message: str, sender: WebSocket) -> None:
    dead = set()
    for ws in _rooms[note_id]:
        if ws is sender:
            continue
        try:
            await ws.send_text(message)
        except Exception:
            dead.add(ws)
    _rooms[note_id] -= dead
