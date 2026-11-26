"""
potholes.py — /api/potholes
----------------------------
GET    /api/potholes          → list all (with filters)
GET    /api/potholes/{id}     → single pothole
POST   /api/potholes          → create manually
PUT    /api/potholes/{id}     → update
DELETE /api/potholes/{id}     → delete (also removes S3 images)
PATCH  /api/potholes/{id}/status → quick status update
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import Pothole, Location
from ..schemas.schemas import PotholeCreate, PotholeUpdate, PotholeResponse
from ..services.s3_service import delete_file
from .auth import get_current_user
from ..models.models import User

router = APIRouter(prefix="/api/potholes", tags=["Potholes"])


@router.get("", response_model=list[PotholeResponse])
def list_potholes(
    severity: Optional[str] = Query(None),
    status:   Optional[str] = Query(None),
    search:   Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
):
    q = db.query(Pothole)
    if severity: q = q.filter(Pothole.severity == severity)
    if status:   q = q.filter(Pothole.status   == status)
    if search:   q = q.filter(Pothole.location_name.ilike(f"%{search}%"))
    return q.order_by(Pothole.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{pothole_id}", response_model=PotholeResponse)
def get_pothole(pothole_id: int, db: Session = Depends(get_db)):
    p = db.query(Pothole).filter(Pothole.id == pothole_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Pothole not found.")
    return p


@router.post("", response_model=PotholeResponse, status_code=201)
def create_pothole(
    data: PotholeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    p = Pothole(
        location_name=data.location_name,
        severity=data.severity,
        confidence=data.confidence,
        notes=data.notes,
        detected_by=current_user.id,
    )
    db.add(p)
    db.flush()  # get the new ID without committing yet

    if data.latitude is not None and data.longitude is not None:
        loc = Location(pothole_id=p.id, latitude=data.latitude, longitude=data.longitude)
        db.add(loc)

    db.commit()
    db.refresh(p)
    return p


@router.put("/{pothole_id}", response_model=PotholeResponse)
def update_pothole(
    pothole_id: int,
    data: PotholeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    p = db.query(Pothole).filter(Pothole.id == pothole_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Pothole not found.")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(p, field, value)
    db.commit()
    db.refresh(p)
    return p


@router.patch("/{pothole_id}/status", response_model=PotholeResponse)
def update_status(
    pothole_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    p = db.query(Pothole).filter(Pothole.id == pothole_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Pothole not found.")
    p.status = status
    db.commit()
    db.refresh(p)
    return p


@router.delete("/{pothole_id}", status_code=204)
def delete_pothole(
    pothole_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    p = db.query(Pothole).filter(Pothole.id == pothole_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Pothole not found.")

    # Remove images from S3 before deleting the DB record
    if p.image_key:        delete_file(p.image_key)
    if p.result_image_key: delete_file(p.result_image_key)

    db.delete(p)
    db.commit()
