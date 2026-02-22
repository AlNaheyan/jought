from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.routers import auth, notes, ai, graph, insights, notebooks

# Create all tables on startup (swap for Alembic migrations in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Jought API", version="0.1.0")

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


@app.get("/health")
def health():
    return {"status": "ok"}
