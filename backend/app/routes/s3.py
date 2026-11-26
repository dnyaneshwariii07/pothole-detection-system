"""
s3.py — /api/s3
----------------
GET  /api/s3/test    → verify S3 connection
POST /api/s3/backup  → trigger a manual database backup to S3
"""

from fastapi import APIRouter, Depends
from ..services.s3_service import test_connection, backup_database
from .auth import get_current_user
from ..models.models import User

router = APIRouter(prefix="/api/s3", tags=["AWS S3"])


@router.get("/test")
def s3_test(current_user: User = Depends(get_current_user)):
    """Test S3 connectivity — useful to verify credentials after setup."""
    return test_connection()


@router.post("/backup")
def trigger_backup(current_user: User = Depends(get_current_user)):
    """Manually backup the SQLite database to S3."""
    result = backup_database()
    if result["success"]:
        return {"message": "Backup successful.", "url": result["url"]}
    return {"message": "Backup failed.", "error": result.get("error")}
