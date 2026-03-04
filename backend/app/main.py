from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine
from app.models.models import Base
from app.routers import auth, notes, ai, graph, insights, notebooks, ws


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables if they don't exist (dev convenience — use Alembic in prod)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Jought API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(notes.router)
app.include_router(ai.router)
app.include_router(graph.router)
app.include_router(insights.router)
app.include_router(notebooks.router)
app.include_router(ws.router)


@app.get("/health")
def health():
    return {"status": "ok"}
