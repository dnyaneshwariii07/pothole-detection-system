"""
models.py
---------
SQLAlchemy ORM models — each class maps to one SQLite table.

Tables created:
  1. users             – admin accounts
  2. potholes          – every detected pothole
  3. detection_history – log of every detection run
  4. citizen_reports   – public complaints
  5. locations         – GPS coordinates linked to potholes
  6. repair_records    – maintenance work log

RELATIONSHIP EXAMPLE:
  A Pothole has one Location (one-to-one).
  A Pothole has many RepairRecords (one-to-many).
  SQLAlchemy handles the JOINs for you via relationship().
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean,
    DateTime, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship
import enum
from ..database import Base


# ── Enum types (stored as strings in SQLite) ────────────────────────────────

class SeverityLevel(str, enum.Enum):
    low      = "Low"
    medium   = "Medium"
    high     = "High"
    critical = "Critical"

class RepairStatus(str, enum.Enum):
    pending     = "Pending"
    in_progress = "In Progress"
    resolved    = "Resolved"

class ReportStatus(str, enum.Enum):
    under_review = "Under Review"
    acknowledged = "Acknowledged"
    resolved     = "Resolved"


def now_utc():
    return datetime.now(timezone.utc)


# ── 1. Users ─────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    username      = Column(String(50), unique=True, nullable=False, index=True)
    email         = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name     = Column(String(100))
    role          = Column(String(20), default="admin")
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime(timezone=True), default=now_utc)
    last_login    = Column(DateTime(timezone=True), nullable=True)


# ── 2. Potholes ──────────────────────────────────────────────────────────────

class Pothole(Base):
    __tablename__ = "potholes"

    id              = Column(Integer, primary_key=True, index=True)
    location_name   = Column(String(255), nullable=False)
    severity        = Column(String(20), default=SeverityLevel.medium)
    status          = Column(String(20), default=RepairStatus.pending)
    confidence      = Column(Float, nullable=False)

    # Image stored on AWS S3 — we keep the URL, not the binary
    image_url       = Column(String(500), nullable=True)   # S3 public URL
    image_key       = Column(String(500), nullable=True)   # S3 object key (for deletion)

    # Result image with bounding boxes drawn on it
    result_image_url = Column(String(500), nullable=True)
    result_image_key = Column(String(500), nullable=True)

    detected_by     = Column(Integer, ForeignKey("users.id"), nullable=True)
    notes           = Column(Text, nullable=True)
    created_at      = Column(DateTime(timezone=True), default=now_utc)
    updated_at      = Column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)

    # Relationships
    location        = relationship("Location", back_populates="pothole", uselist=False, cascade="all, delete-orphan")
    repair_records  = relationship("RepairRecord", back_populates="pothole", cascade="all, delete-orphan")
    detection_runs  = relationship("DetectionHistory", back_populates="pothole", cascade="all, delete-orphan")


# ── 3. DetectionHistory ──────────────────────────────────────────────────────

class DetectionHistory(Base):
    __tablename__ = "detection_history"

    id              = Column(Integer, primary_key=True, index=True)
    pothole_id      = Column(Integer, ForeignKey("potholes.id"), nullable=True)
    image_url       = Column(String(500), nullable=True)
    model_version   = Column(String(50), default="mock-v1")
    confidence      = Column(Float)
    potholes_found  = Column(Integer, default=0)
    processing_ms   = Column(Integer, default=0)
    created_at      = Column(DateTime(timezone=True), default=now_utc)

    pothole         = relationship("Pothole", back_populates="detection_runs")


# ── 4. CitizenReports ────────────────────────────────────────────────────────

class CitizenReport(Base):
    __tablename__ = "citizen_reports"

    id              = Column(Integer, primary_key=True, index=True)
    reporter_name   = Column(String(100), nullable=False)
    reporter_phone  = Column(String(20), nullable=False)
    location        = Column(String(255), nullable=False)
    description     = Column(Text, nullable=False)
    image_url       = Column(String(500), nullable=True)   # S3 URL
    image_key       = Column(String(500), nullable=True)
    status          = Column(String(30), default=ReportStatus.under_review)
    created_at      = Column(DateTime(timezone=True), default=now_utc)
    updated_at      = Column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)


# ── 5. Locations ─────────────────────────────────────────────────────────────

class Location(Base):
    __tablename__ = "locations"

    id          = Column(Integer, primary_key=True, index=True)
    pothole_id  = Column(Integer, ForeignKey("potholes.id"), unique=True, nullable=False)
    latitude    = Column(Float, nullable=False)
    longitude   = Column(Float, nullable=False)
    address     = Column(String(255), nullable=True)
    city        = Column(String(100), nullable=True)
    created_at  = Column(DateTime(timezone=True), default=now_utc)

    pothole     = relationship("Pothole", back_populates="location")


# ── 6. RepairRecords ─────────────────────────────────────────────────────────

class RepairRecord(Base):
    __tablename__ = "repair_records"

    id              = Column(Integer, primary_key=True, index=True)
    pothole_id      = Column(Integer, ForeignKey("potholes.id"), nullable=False)
    technician_name = Column(String(100), nullable=True)
    work_description = Column(Text, nullable=True)
    cost            = Column(Float, default=0.0)
    status          = Column(String(20), default=RepairStatus.pending)
    scheduled_date  = Column(DateTime(timezone=True), nullable=True)
    completed_date  = Column(DateTime(timezone=True), nullable=True)
    created_at      = Column(DateTime(timezone=True), default=now_utc)

    pothole         = relationship("Pothole", back_populates="repair_records")
