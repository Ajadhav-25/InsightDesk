"""
InsightDesk Backend — Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

app = FastAPI(
    title="InsightDesk API",
    description="Business analytics API for InsightDesk dashboard",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

# ─── Routers (registered in Phase 3) ─────────────────────────────────────────
# from app.api import dashboard, analytics, orders, filters
# app.include_router(dashboard.router, prefix="/api")
# app.include_router(analytics.router, prefix="/api/analytics")
# app.include_router(orders.router, prefix="/api")
# app.include_router(filters.router, prefix="/api")


@app.get("/api/health")
def health_check():
    """Health check endpoint — confirms the API is running."""
    return {"status": "ok", "service": "InsightDesk API"}
