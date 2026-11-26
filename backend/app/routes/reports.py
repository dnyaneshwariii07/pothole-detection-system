"""
reports.py — /api/reports
--------------------------
GET    /api/reports         → list all citizen reports
POST   /api/reports         → submit a new report (with optional image → S3)
PATCH  /api/reports/{id}/status → update status
DELETE /api/reports/{id}    → delete report
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import CitizenReport
from ..schemas.schemas import CitizenReportResponse
from ..services.s3_service import upload_file, delete_file
from .auth import get_current_user
from ..models.models import User

router = APIRouter(prefix="/api/reports", tags=["Citizen Reports"])


@router.get("", response_model=list[CitizenReportResponse])
def list_reports(db: Session = Depends(get_db)):
    return db.query(CitizenReport).order_by(CitizenReport.created_at.desc()).all()


@router.post("", response_model=CitizenReportResponse, status_code=201)
async def submit_report(
    reporter_name:  str = Form(...),
    reporter_phone: str = Form(...),
    location:       str = Form(...),
    description:    str = Form(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    image_url = None
    image_key = None

    # Upload photo to S3 if provided
    if image and image.filename:
        img_bytes = await image.read()
        result = upload_file(img_bytes, image.filename, folder="reports")
        if result.get("success"):
            image_url = result["url"]
            image_key = result["key"]

    report = CitizenReport(
        reporter_name  = reporter_name,
        reporter_phone = reporter_phone,
        location       = location,
        description    = description,
        image_url      = image_url,
        image_key      = image_key,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.patch("/{report_id}/status", response_model=CitizenReportResponse)
def update_report_status(
    report_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = db.query(CitizenReport).filter(CitizenReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    report.status = status
    db.commit()
    db.refresh(report)
    return report


@router.delete("/{report_id}", status_code=204)
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = db.query(CitizenReport).filter(CitizenReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    if report.image_key:
        delete_file(report.image_key)
    db.delete(report)
    db.commit()
