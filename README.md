# 🕳️ PotHole Detection System

A full-stack smart-city web application for detecting, tracking, and managing road potholes using AI, cloud storage, and interactive maps.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Features](#features)
5. [Database Design](#database-design)
6. [API Reference](#api-reference)
7. [AWS S3 Integration](#aws-s3-integration)
8. [Getting Started](#getting-started)
9. [Running the Project](#running-the-project)
10. [Pages & UI Guide](#pages--ui-guide)
11. [Development Phases](#development-phases)
12. [Environment Variables](#environment-variables)
13. [Troubleshooting](#troubleshooting)

---

## Project Overview

The PotHole Detection System is a web-based municipal road monitoring tool that:

- Detects potholes from uploaded road images using YOLO AI
- Stores detection images on **AWS S3** (Europe Stockholm region)
- Records all detections in a local **SQLite** database
- Displays potholes on an **interactive OpenStreetMap**
- Lets citizens submit pothole complaints with photo evidence
- Gives administrators a live **analytics dashboard**

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React.js | 19 | UI framework |
| Vite | 8 | Build tool and dev server |
| Tailwind CSS | 4 | Styling |
| React Router | 7 | Client-side routing |
| Axios | 1.x | HTTP requests to backend |
| Recharts | 3.x | Charts and graphs |
| Leaflet + react-leaflet | 1.9 / 5.x | Interactive maps |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.14 | Runtime |
| FastAPI | 0.111 | REST API framework |
| SQLAlchemy | 2.1 | ORM for database operations |
| Pydantic | 2.x | Data validation and schemas |
| Uvicorn | 0.29 | ASGI web server |
| python-jose | 3.x | JWT authentication |
| passlib + bcrypt | 1.x | Password hashing |
| boto3 | 1.34 | AWS SDK for S3 |
| Pillow | 13 | Image processing |

### Database & Cloud
| Service | Purpose |
|---|---|
| SQLite | Primary database (local file) |
| AWS S3 (eu-north-1) | Image storage and DB backups |

---

## Project Structure

```
pothole-detection-system/
│
├── frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── DashboardLayout.jsx   # Shell with sidebar + header
│   │   │   │   ├── Header.jsx            # Top navigation bar
│   │   │   │   ├── ProtectedRoute.jsx    # Auth guard for routes
│   │   │   │   └── Sidebar.jsx           # Left navigation panel
│   │   │   └── ui/
│   │   │       ├── SeverityBadge.jsx     # Colour-coded status pill
│   │   │       └── StatCard.jsx          # Dashboard metric card
│   │   ├── data/
│   │   │   └── mockData.js               # Fallback mock data
│   │   ├── pages/
│   │   │   ├── Analytics.jsx             # Charts and CSV export
│   │   │   ├── CitizenReports.jsx        # Public complaint form
│   │   │   ├── Dashboard.jsx             # Main overview page
│   │   │   ├── Detection.jsx             # Image upload and detection
│   │   │   ├── Login.jsx                 # Authentication page
│   │   │   ├── MapView.jsx               # Leaflet map with markers
│   │   │   ├── Records.jsx               # Pothole records table
│   │   │   └── Settings.jsx              # Admin settings + S3 tools
│   │   ├── services/
│   │   │   ├── api.js                    # Axios instance with JWT
│   │   │   └── AuthContext.jsx           # React Context for auth state
│   │   ├── App.jsx                       # Route definitions
│   │   ├── main.jsx                      # React entry point
│   │   └── index.css                     # Tailwind + global styles
│   ├── index.html
│   └── package.json
│
├── backend (FastAPI + Python)
│   ├── app/
│   │   ├── models/
│   │   │   └── models.py                 # SQLAlchemy ORM models (6 tables)
│   │   ├── routes/
│   │   │   ├── auth.py                   # /api/auth/*
│   │   │   ├── dashboard.py              # /api/dashboard/*
│   │   │   ├── detection.py              # /api/detect
│   │   │   ├── potholes.py               # /api/potholes/*
│   │   │   ├── reports.py                # /api/reports/*
│   │   │   └── s3.py                     # /api/s3/*
│   │   ├── schemas/
│   │   │   └── schemas.py                # Pydantic request/response models
│   │   ├── services/
│   │   │   ├── auth_service.py           # JWT + bcrypt
│   │   │   ├── detection_service.py      # Detection pipeline (mock → YOLO)
│   │   │   └── s3_service.py             # AWS S3 upload/delete/backup
│   │   ├── config.py                     # Settings from .env
│   │   ├── database.py                   # SQLAlchemy engine + session
│   │   └── main.py                       # FastAPI app + startup
│   ├── uploads/                          # Local fallback for images
│   ├── .env                              # Environment variables (never commit)
│   ├── .gitignore
│   ├── pothole_detection.db              # SQLite database (auto-created)
│   └── requirements.txt
│
└── README.md
```

---

## Features

### ✅ Completed (Phase 1 & 2)

| Feature | Status | Details |
|---|---|---|
| Admin Login | ✅ | JWT authentication, bcrypt passwords |
| Dashboard | ✅ | Live stats, charts, activity feed |
| Image Upload | ✅ | Drag & drop, preview, 10 MB limit |
| AWS S3 Storage | ✅ | Original + annotated images stored in S3 |
| Mock Detection | ✅ | Simulates YOLO results for testing |
| Pothole Records | ✅ | Search, filter, view, delete, update status |
| Interactive Map | ✅ | Leaflet + OpenStreetMap with severity markers |
| Citizen Reports | ✅ | Public form with optional S3 photo upload |
| Analytics | ✅ | Bar/pie/radial charts, CSV export |
| Settings | ✅ | S3 connection test, database backup |
| Protected Routes | ✅ | Unauthenticated users redirected to login |
| Mock Fallback | ✅ | Frontend shows mock data if backend is down |

### 🔄 Coming (Phase 3)

| Feature | Status |
|---|---|
| Real YOLO Detection | Planned |
| OpenCV Bounding Boxes | Planned |
| Custom Pothole Model | Planned |

---

## Database Design

The SQLite database (`pothole_detection.db`) is created automatically on first run.

### Tables

#### 1. `users`
Stores admin accounts.

| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | Auto-increment |
| username | VARCHAR(50) UNIQUE | Login username |
| email | VARCHAR(100) UNIQUE | Email address |
| hashed_password | VARCHAR(255) | bcrypt hash |
| full_name | VARCHAR(100) | Display name |
| role | VARCHAR(20) | `admin` or `viewer` |
| is_active | BOOLEAN | Account enabled flag |
| created_at | DATETIME | Registration timestamp |
| last_login | DATETIME | Last login timestamp |

#### 2. `potholes`
Core table — one row per detected pothole.

| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | Auto-increment |
| location_name | VARCHAR(255) | Human-readable address |
| severity | VARCHAR(20) | Low / Medium / High / Critical |
| status | VARCHAR(20) | Pending / In Progress / Resolved |
| confidence | FLOAT | AI detection confidence (0–100) |
| image_url | VARCHAR(500) | AWS S3 URL of original image |
| image_key | VARCHAR(500) | S3 object key (for deletion) |
| result_image_url | VARCHAR(500) | S3 URL of annotated image |
| result_image_key | VARCHAR(500) | S3 key of annotated image |
| detected_by | FK → users.id | Admin who triggered detection |
| notes | TEXT | Optional admin notes |
| created_at | DATETIME | Detection timestamp |
| updated_at | DATETIME | Last update timestamp |

#### 3. `detection_history`
Log of every detection run (one pothole can have multiple scans).

| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | Auto-increment |
| pothole_id | FK → potholes.id | Linked pothole |
| image_url | VARCHAR(500) | S3 URL used for this run |
| model_version | VARCHAR(50) | Model identifier |
| confidence | FLOAT | Confidence score |
| potholes_found | INTEGER | Count of potholes in image |
| processing_ms | INTEGER | Processing time in milliseconds |
| created_at | DATETIME | Run timestamp |

#### 4. `citizen_reports`
Public complaint submissions.

| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | Auto-increment |
| reporter_name | VARCHAR(100) | Citizen's name |
| reporter_phone | VARCHAR(20) | Contact number |
| location | VARCHAR(255) | Reported location |
| description | TEXT | Complaint description |
| image_url | VARCHAR(500) | S3 URL of uploaded photo |
| image_key | VARCHAR(500) | S3 key for deletion |
| status | VARCHAR(30) | Under Review / Acknowledged / Resolved |
| created_at | DATETIME | Submission timestamp |
| updated_at | DATETIME | Last status change |

#### 5. `locations`
GPS coordinates linked to potholes (one-to-one).

| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | Auto-increment |
| pothole_id | FK → potholes.id UNIQUE | One location per pothole |
| latitude | FLOAT | GPS latitude |
| longitude | FLOAT | GPS longitude |
| address | VARCHAR(255) | Optional street address |
| city | VARCHAR(100) | Optional city name |
| created_at | DATETIME | Record timestamp |

#### 6. `repair_records`
Maintenance work log (one-to-many with potholes).

| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | Auto-increment |
| pothole_id | FK → potholes.id | Linked pothole |
| technician_name | VARCHAR(100) | Assigned technician |
| work_description | TEXT | Work done |
| cost | FLOAT | Repair cost |
| status | VARCHAR(20) | Pending / In Progress / Resolved |
| scheduled_date | DATETIME | Planned repair date |
| completed_date | DATETIME | Actual completion date |
| created_at | DATETIME | Record creation |

### Relationships

```
users          ──< potholes          (one admin detects many potholes)
potholes       ──  locations         (one pothole has one GPS location)
potholes       ──< repair_records    (one pothole has many repair logs)
potholes       ──< detection_history (one pothole has many scan logs)
```

---

## API Reference

Base URL: `http://localhost:8000/api`
Interactive docs: `http://localhost:8000/api/docs`

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Login, returns JWT token |
| GET | `/auth/me` | Required | Get current user info |

**Login request:**
```json
{ "username": "admin", "password": "admin123" }
```

**Login response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": { "username": "admin", "name": "Admin User", "role": "admin" }
}
```

All protected endpoints require the header:
```
Authorization: Bearer <access_token>
```

---

### Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/dashboard/stats` | Required | Aggregated statistics for all dashboard cards and charts |

**Response:**
```json
{
  "total_potholes": 0,
  "critical_potholes": 0,
  "pending_repairs": 0,
  "resolved_potholes": 0,
  "total_reports": 0,
  "monthly_data": [],
  "severity_data": []
}
```

---

### Detection

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/detect` | Required | Upload image, run detection, save to DB and S3 |

**Request:** `multipart/form-data`
- `file` — image file (JPG / PNG / WEBP, max 10 MB)
- `location_name` — query param, e.g. `MG Road, Bangalore`
- `latitude` — query param (optional)
- `longitude` — query param (optional)

**Response:**
```json
{
  "pothole_id": 1,
  "potholes_detected": 2,
  "detections": [
    { "id": 1, "confidence": 94.7, "severity": "High", "bbox": [120, 80, 280, 200] }
  ],
  "overall_severity": "High",
  "avg_confidence": 87.5,
  "image_url": "https://pothole-detection-images79.s3.eu-north-1.amazonaws.com/...",
  "result_image_url": "https://pothole-detection-images79.s3.eu-north-1.amazonaws.com/...",
  "processing_time_ms": 412,
  "saved_to_db": true,
  "s3_upload": true
}
```

---

### Potholes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/potholes` | Public | List all potholes (supports `?severity=High&status=Pending&search=MG`) |
| GET | `/potholes/{id}` | Public | Get single pothole with location |
| POST | `/potholes` | Required | Create pothole manually |
| PUT | `/potholes/{id}` | Required | Update pothole fields |
| PATCH | `/potholes/{id}/status` | Required | Quick status change (`?status=Resolved`) |
| DELETE | `/potholes/{id}` | Required | Delete pothole and its S3 images |

---

### Citizen Reports

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/reports` | Public | List all citizen reports |
| POST | `/reports` | Public | Submit new report (multipart, optional image) |
| PATCH | `/reports/{id}/status` | Required | Update report status |
| DELETE | `/reports/{id}` | Required | Delete report and S3 photo |

---

### AWS S3

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/s3/test` | Required | Test S3 connection |
| POST | `/s3/backup` | Required | Backup SQLite DB to S3 |

---

## AWS S3 Integration

### Bucket Details

| Setting | Value |
|---|---|
| Bucket name | `pothole-detection-images79` |
| Region | `eu-north-1` (Europe Stockholm) |

### S3 Folder Structure

```
pothole-detection-images79/
├── potholes/
│   ├── originals/
│   │   └── 2026-11-23/
│   │       └── abc123def.jpg       ← original uploaded image
│   └── results/
│       └── 2026-11-23/
│           └── result_abc123def.jpg ← image with bounding boxes drawn
├── reports/
│   └── 2026-11-23/
│       └── xyz789.jpg              ← citizen report photo
└── backups/
    └── pothole_detection_2026-11-23_14-30-00.db  ← DB backup
```

### How Images Flow

```
1. User uploads image on /detection page
2. React sends multipart POST to /api/detect
3. FastAPI reads file bytes
4. Uploads original to S3 → potholes/originals/YYYY-MM-DD/uuid.jpg
5. Runs mock YOLO detection (Phase 3: real YOLO)
6. Draws bounding boxes on image with Pillow
7. Uploads annotated image to S3 → potholes/results/YYYY-MM-DD/result_uuid.jpg
8. Saves both S3 URLs to SQLite database
9. Returns S3 URLs to React frontend
10. Frontend displays annotated image from S3
```

### S3 URLs Format

```
https://{bucket}.s3.{region}.amazonaws.com/{key}

Example:
https://pothole-detection-images79.s3.eu-north-1.amazonaws.com/potholes/originals/2026-11-23/abc123.jpg
```

---

## Getting Started

### Prerequisites

| Tool | Version | Download |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| Python | 3.11+ | https://python.org |
| AWS Account | — | https://aws.amazon.com |

### 1. Clone / navigate to the project

```bash
cd C:\Users\hp\PotHoleDetection\pothole-detection-system
```

### 2. Configure AWS credentials

Open `backend/.env` and fill in your keys:

```env
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=eu-north-1
S3_BUCKET_NAME=pothole-detection-images79
```

**Important:** Never commit `.env` to Git. It is listed in `.gitignore`.

---

## Running the Project

### Start the Backend

```bash
cd backend
.\venv\Scripts\activate          # Windows
# source venv/bin/activate       # Mac / Linux

uvicorn app.main:app --reload --port 8000
```

Expected output:
```
✅ Default admin account created: admin / admin123
✅ AWS S3: Connected to S3 bucket: pothole-detection-images79
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Start the Frontend

```bash
# In a separate terminal
cd pothole-detection-system        # project root
npm run dev
```

Expected output:
```
VITE v8.3.8  ready in 2814 ms
➜  Local:   http://localhost:3000/
```

### Open the App

| URL | Purpose |
|---|---|
| http://localhost:3000 | React frontend |
| http://localhost:8000/api/docs | Swagger API documentation |
| http://localhost:8000/api/health | Backend health check |

### Login Credentials

```
Username: admin
Password: admin123
```

---

## Pages & UI Guide

### Login (`/login`)
- Enter credentials to get a JWT token
- Token is stored in `localStorage` and sent with every API request
- Wrong credentials show an error message

### Dashboard (`/dashboard`)
- **4 stat cards** — total, critical, pending, resolved potholes (live from DB)
- **Line chart** — monthly detections vs resolutions
- **Pie chart** — severity distribution
- **Recent detections table** — latest 5 from DB
- **Activity feed** — static recent actions
- Shows a warning banner if the backend is unreachable (uses mock data)

### Pothole Detection (`/detection`)
1. Drag & drop or click to upload a road image
2. Optionally enter location name, latitude, longitude
3. Click **Detect Potholes**
4. FastAPI uploads the image to S3 and runs detection
5. The annotated result image (from S3) is displayed
6. Detection details show confidence, severity per pothole
7. A badge shows whether the image was saved to S3

### Pothole Records (`/records`)
- Filter by severity, status, and location search
- Each row shows a link to the S3 image
- **View** opens a modal with full details and status update buttons
- **Delete** removes the record from DB and the image from S3
- Falls back to mock data if the backend is down

### Map View (`/map`)
- OpenStreetMap powered by Leaflet
- Each pothole plotted with a colour-coded marker:
  - 🟣 Purple = Critical
  - 🔴 Red = High
  - 🟡 Yellow = Medium
  - 🟢 Green = Low
- Click a marker to see location, severity, status, confidence

### Citizen Reports (`/reports`)
- **Top section** — public submission form (no login required)
- Optional photo upload (stored on S3 if connected)
- **Bottom section** — table of all submissions with status badges
- S3 photo shows a "☁️ View" link

### Analytics (`/analytics`)
- KPI cards — total, critical, resolution rate, monthly average
- **Bar chart** — monthly detections vs resolutions
- **Pie chart** — severity distribution
- **Radial chart** — repair status overview
- **Export CSV button** — downloads monthly data as a CSV file

### Settings (`/settings`)
- **Admin profile** — name, email, phone, organisation
- **Detection settings** — confidence threshold slider, toggle switches
- **AWS S3 panel**:
  - 🔌 **Test S3 Connection** — verifies your credentials work
  - 💾 **Backup DB to S3** — uploads the SQLite file to S3 as a timestamped backup
- App version info

---

## Development Phases

### ✅ Phase 1 — React Frontend (Complete)
- Vite + React + Tailwind CSS setup
- All 8 pages built with mock data
- Login, routing, auth context
- Recharts, Leaflet map

### ✅ Phase 2 — FastAPI Backend + AWS S3 (Complete)
- FastAPI with all REST endpoints
- SQLite + SQLAlchemy (6 tables)
- JWT authentication with bcrypt
- AWS S3 image upload and storage
- DB backup to S3
- Frontend connected to real API

### 🔄 Phase 3 — Real YOLO Detection (Planned)
- Install `ultralytics` (YOLOv8) and `opencv-python`
- Download pre-trained pothole model
- Replace `mock_detect()` with real YOLO inference
- OpenCV draws accurate bounding boxes
- Severity based on detected bounding box area

---

## Environment Variables

All variables live in `backend/.env`.

| Variable | Required | Default | Description |
|---|---|---|---|
| `AWS_ACCESS_KEY_ID` | ✅ | — | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | ✅ | — | AWS IAM secret key |
| `AWS_REGION` | ✅ | `eu-north-1` | S3 bucket region |
| `S3_BUCKET_NAME` | ✅ | `pothole-detection-images79` | S3 bucket name |
| `SECRET_KEY` | ✅ | — | JWT signing secret (change in production) |
| `ALGORITHM` | — | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | — | `60` | Token expiry |
| `DATABASE_URL` | — | `sqlite:///./pothole_detection.db` | Database path |
| `UPLOAD_FOLDER` | — | `uploads` | Local fallback folder |

---

## Troubleshooting

### S3 shows 403 Forbidden
Your AWS keys in `.env` are incorrect or still placeholder values.
1. Go to AWS IAM → Users → pothole-app-user → Security credentials
2. Delete the old key, create a new one
3. Paste the new values into `backend/.env`
4. Restart the backend server

### S3 shows 404 Bucket not found
The bucket name in `.env` doesn't match what you created in AWS.
Check: `AWS Console → S3` and confirm the exact bucket name.

### Backend won't start — `ModuleNotFoundError`
The virtual environment is not activated or a package is missing.
```bash
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend shows mock data warning
The backend is not running. Start it with:
```bash
cd backend
.\venv\Scripts\uvicorn app.main:app --reload --port 8000
```

### Login fails with "Invalid credentials"
The default admin account is `admin` / `admin123`.
If you changed it, the account is in the `users` table in `pothole_detection.db`.

### Port 3000 or 8000 already in use
```bash
# Find what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Kill the process by PID
taskkill /PID <pid> /F
```

### SQLAlchemy errors on startup
Make sure you are using SQLAlchemy 2.1+:
```bash
cd backend
.\venv\Scripts\pip install --upgrade sqlalchemy
```

---

## Security Notes

- Never commit `.env` to version control — it is in `.gitignore`
- Never share your AWS keys in chat, email, or any public place
- Rotate keys immediately if accidentally exposed (AWS IAM → delete + recreate)
- Change `SECRET_KEY` in `.env` before deploying to production
- In production, restrict S3 bucket policy to only allow your server's IP

---

*Built with React, FastAPI, SQLite, and AWS S3 — PotHole Detection System v2.0*
