"""
main.py
-------
FastAPI application entry point.

On startup:
  1. Creates all database tables (if they don't exist)
  2. Creates the default admin account
  3. Tests S3 connectivity and logs the result
  4. Registers all route modules

CORS is configured to allow requests from the React frontend on port 3000.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .database import engine, SessionLocal
from .models.models import Base
from .services.auth_service import create_default_admin
from .services.s3_service import test_connection
from .routes import auth, potholes, detection, reports, dashboard, s3

# ── Create all tables ────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="PotHole Detection API",
    description="REST API for the PotHole Detection System with AWS S3 storage",
    version="2.0.0",
    docs_url="/api/docs",        # Swagger UI at http://localhost:8000/api/docs
    redoc_url="/api/redoc",
)

# ── CORS — allow React dev server + Vercel production ────────────────────────
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Vercel deployments — covers all preview + production URLs
    "https://pothole-detection-system.vercel.app",
    "https://pothole-detection-system-dnyaneshwariii07.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # wide open for local development
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Serve local uploads as static files (fallback if S3 is not configured) ──
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ── Register routers ─────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(potholes.router)
app.include_router(detection.router)
app.include_router(reports.router)
app.include_router(dashboard.router)
app.include_router(s3.router)


# ── Startup event ─────────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    # Create default admin user
    db = SessionLocal()
    try:
        create_default_admin(db)
    finally:
        db.close()

    # Test S3 connection
    s3_status = test_connection()
    if s3_status["success"]:
        print(f"✅ AWS S3: {s3_status['message']}")
    else:
        print(f"⚠️  AWS S3: {s3_status.get('error')} — images will be saved locally only.")


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/api/health")
def health_check():
    s3_status = test_connection()
    return {
        "status": "ok",
        "version": "2.0.0",
        "s3_connected": s3_status["success"],
        "s3_bucket": s3_status.get("message", s3_status.get("error")),
    }
