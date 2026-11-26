"""
s3_service.py
-------------
All AWS S3 operations live here.

WHAT THIS DOES:
  - upload_file()   → uploads an image to S3, returns the public URL
  - delete_file()   → removes an image from S3 by its key
  - backup_database() → uploads the SQLite .db file to S3 as a backup

HOW S3 WORKS:
  Every file in S3 has a "key" — think of it as the file path inside the bucket.
  Example key:  "potholes/2026-11-23/detection_abc123.jpg"
  Public URL:   "https://pothole-detection-images79.s3.eu-north-1.amazonaws.com/potholes/2026-11-23/detection_abc123.jpg"
"""

import uuid
import os
from datetime import datetime, timezone
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from ..config import settings


def _get_s3_client():
    """Create and return an S3 client using credentials from .env"""
    return boto3.client(
        "s3",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )


def upload_file(file_bytes: bytes, original_filename: str, folder: str = "potholes") -> dict:
    """
    Upload image bytes to S3.

    Args:
        file_bytes:        raw bytes of the image file
        original_filename: original name like "road.jpg"
        folder:            S3 "folder" prefix, e.g. "potholes", "reports"

    Returns:
        { "url": "https://...", "key": "potholes/2026-11-23/uuid.jpg", "success": True }
    """
    try:
        s3 = _get_s3_client()

        # Build a unique key so files never overwrite each other
        date_prefix = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        ext         = os.path.splitext(original_filename)[1].lower() or ".jpg"
        unique_name = f"{uuid.uuid4().hex}{ext}"
        key         = f"{folder}/{date_prefix}/{unique_name}"

        # Determine content type
        content_type_map = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
        }
        content_type = content_type_map.get(ext, "image/jpeg")

        s3.put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=key,
            Body=file_bytes,
            ContentType=content_type,
        )

        url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"

        return {"success": True, "url": url, "key": key}

    except NoCredentialsError:
        return {"success": False, "error": "AWS credentials not configured correctly."}
    except ClientError as e:
        return {"success": False, "error": str(e)}
    except Exception as e:
        return {"success": False, "error": str(e)}


def delete_file(key: str) -> bool:
    """
    Delete a file from S3 by its key.
    Returns True on success, False on failure.
    """
    if not key:
        return True  # nothing to delete
    try:
        s3 = _get_s3_client()
        s3.delete_object(Bucket=settings.S3_BUCKET_NAME, Key=key)
        return True
    except Exception:
        return False


def backup_database(db_path: str = "pothole_detection.db") -> dict:
    """
    Upload the SQLite database file to S3 as a timestamped backup.
    Call this on a schedule or after major operations.

    Returns the backup URL or an error message.
    """
    try:
        if not os.path.exists(db_path):
            return {"success": False, "error": "Database file not found."}

        with open(db_path, "rb") as f:
            db_bytes = f.read()

        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d_%H-%M-%S")
        key = f"backups/pothole_detection_{timestamp}.db"

        s3 = _get_s3_client()
        s3.put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=key,
            Body=db_bytes,
            ContentType="application/octet-stream",
        )

        url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
        return {"success": True, "url": url, "key": key}

    except Exception as e:
        return {"success": False, "error": str(e)}


def test_connection() -> dict:
    """
    Quick connectivity test — lists the bucket to verify credentials work.
    Called on app startup.
    """
    try:
        s3 = _get_s3_client()
        s3.head_bucket(Bucket=settings.S3_BUCKET_NAME)
        return {"success": True, "message": f"Connected to S3 bucket: {settings.S3_BUCKET_NAME}"}
    except NoCredentialsError:
        return {"success": False, "error": "AWS credentials missing or invalid."}
    except ClientError as e:
        code = e.response["Error"]["Code"]
        if code == "404":
            return {"success": False, "error": f"Bucket '{settings.S3_BUCKET_NAME}' does not exist."}
        return {"success": False, "error": str(e)}
    except Exception as e:
        return {"success": False, "error": str(e)}
