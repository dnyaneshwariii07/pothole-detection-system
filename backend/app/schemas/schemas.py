"""
schemas.py
----------
Pydantic schemas define the shape of data coming IN (requests)
and going OUT (responses) through the API.

They are separate from the SQLAlchemy models because:
  - Models describe the DATABASE structure
  - Schemas describe the API contract
  - You often want to hide fields (e.g. hashed_password)
    or add computed fields in the response.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


# ── Auth ────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ── Users ───────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Location ─────────────────────────────────────────────────────────────────

class LocationCreate(BaseModel):
    latitude: float
    longitude: float
    address: Optional[str] = None
    city: Optional[str] = None

class LocationResponse(BaseModel):
    id: int
    latitude: float
    longitude: float
    address: Optional[str]
    city: Optional[str]

    model_config = {"from_attributes": True}


# ── Potholes ─────────────────────────────────────────────────────────────────

class PotholeCreate(BaseModel):
    location_name: str
    severity: str = "Medium"
    confidence: float
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notes: Optional[str] = None

class PotholeUpdate(BaseModel):
    location_name: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class PotholeResponse(BaseModel):
    id: int
    location_name: str
    severity: str
    status: str
    confidence: float
    image_url: Optional[str]
    result_image_url: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    location: Optional[LocationResponse] = None

    model_config = {"from_attributes": True}


# ── Detection ────────────────────────────────────────────────────────────────

class DetectionResult(BaseModel):
    pothole_id: int
    potholes_detected: int
    detections: List[dict]
    image_url: str
    result_image_url: Optional[str]
    processing_time_ms: int
    saved_to_db: bool = True


# ── Citizen Reports ──────────────────────────────────────────────────────────

class CitizenReportCreate(BaseModel):
    reporter_name: str
    reporter_phone: str
    location: str
    description: str

class CitizenReportUpdate(BaseModel):
    status: str

class CitizenReportResponse(BaseModel):
    id: int
    reporter_name: str
    reporter_phone: str
    location: str
    description: str
    image_url: Optional[str]
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Repair Records ────────────────────────────────────────────────────────────

class RepairRecordCreate(BaseModel):
    pothole_id: int
    technician_name: Optional[str] = None
    work_description: Optional[str] = None
    cost: float = 0.0
    status: str = "Pending"

class RepairRecordResponse(BaseModel):
    id: int
    pothole_id: int
    technician_name: Optional[str]
    work_description: Optional[str]
    cost: float
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Dashboard Stats ───────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_potholes: int
    critical_potholes: int
    pending_repairs: int
    resolved_potholes: int
    total_reports: int
    monthly_data: List[dict]
    severity_data: List[dict]
