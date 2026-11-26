"""
detection.py — /api/detect
---------------------------
POST /api/detect   → upload image, run detection, save to DB, return results
"""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import Pothole, Location, DetectionHistory
from ..services.detection_service import run_detection_pipeline
from .auth import get_current_user
from ..models.models import User

router = APIRouter(prefix="/api/detect", tags=["Detection"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("")
async def detect_potholes(
    file: UploadFile = File(...),
    location_name: str = "Unknown Location",
    latitude:  float = None,
    longitude: float = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and WEBP images are accepted.")

    # Read file bytes
    image_bytes = await file.read()

    # Validate file size
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Image must be under 10 MB.")

    # Run the full pipeline: upload to S3 + detect
    result = await run_detection_pipeline(image_bytes, file.filename or "image.jpg")

    # Save to database
    pothole = Pothole(
        location_name    = location_name,
        severity         = result["overall_severity"],
        status           = "Pending",
        confidence       = result["avg_confidence"],
        image_url        = result.get("image_url"),
        image_key        = result.get("image_key"),
        result_image_url = result.get("result_image_url"),
        result_image_key = result.get("result_image_key"),
        detected_by      = current_user.id,
    )
    db.add(pothole)
    db.flush()

    # Save GPS location if provided
    if latitude is not None and longitude is not None:
        loc = Location(pothole_id=pothole.id, latitude=latitude, longitude=longitude, address=location_name)
        db.add(loc)

    # Log the detection run
    history = DetectionHistory(
        pothole_id     = pothole.id,
        image_url      = result.get("image_url"),
        confidence     = result["avg_confidence"],
        potholes_found = result["potholes_found"],
        processing_ms  = result["processing_ms"],
    )
    db.add(history)
    db.commit()
    db.refresh(pothole)

    return {
        "pothole_id":        pothole.id,
        "potholes_detected": result["potholes_found"],
        "detections":        result["detections"],
        "overall_severity":  result["overall_severity"],
        "avg_confidence":    result["avg_confidence"],
        "image_url":         result.get("image_url"),
        "result_image_url":  result.get("result_image_url"),
        "processing_time_ms": result["processing_ms"],
        "saved_to_db":       True,
        "s3_upload":         result.get("s3_success", False),
    }
