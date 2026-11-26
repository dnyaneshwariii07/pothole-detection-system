"""
dashboard.py — /api/dashboard
------------------------------
GET /api/dashboard/stats → aggregated stats for the dashboard cards + charts
"""

from fastapi import APIRouter, Depends
from sqlalchemy import func, case
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import Pothole, CitizenReport
from ..schemas.schemas import DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):

    total     = db.query(func.count(Pothole.id)).scalar() or 0
    critical  = db.query(func.count(Pothole.id)).filter(Pothole.severity == "Critical").scalar() or 0
    pending   = db.query(func.count(Pothole.id)).filter(Pothole.status == "Pending").scalar() or 0
    resolved  = db.query(func.count(Pothole.id)).filter(Pothole.status == "Resolved").scalar() or 0
    reports   = db.query(func.count(CitizenReport.id)).scalar() or 0

    # Monthly breakdown
    monthly_raw = (
        db.query(
            func.strftime("%Y-%m", Pothole.created_at).label("month"),
            func.count(Pothole.id).label("detections"),
            func.sum(case((Pothole.status == "Resolved", 1), else_=0)).label("resolved"),
        )
        .group_by(func.strftime("%Y-%m", Pothole.created_at))
        .order_by("month")
        .all()
    )

    monthly_data = [
        {"month": row.month, "detections": row.detections, "resolved": int(row.resolved or 0)}
        for row in monthly_raw
    ]

    # Severity breakdown
    severity_raw = (
        db.query(Pothole.severity, func.count(Pothole.id).label("count"))
        .group_by(Pothole.severity)
        .all()
    )
    color_map = {"Low": "#22c55e", "Medium": "#f59e0b", "High": "#ef4444", "Critical": "#7c3aed"}
    severity_data = [
        {"name": row.severity, "value": row.count, "color": color_map.get(row.severity, "#94a3b8")}
        for row in severity_raw
    ]

    return DashboardStats(
        total_potholes    = total,
        critical_potholes = critical,
        pending_repairs   = pending,
        resolved_potholes = resolved,
        total_reports     = reports,
        monthly_data      = monthly_data,
        severity_data     = severity_data,
    )
