"""
auth.py — /api/auth
--------------------
POST /api/auth/login   → returns JWT token
GET  /api/auth/me      → returns current user info
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.schemas import LoginRequest, TokenResponse, UserResponse
from ..services.auth_service import authenticate_user, create_access_token, decode_token
from ..models.models import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Dependency: decodes JWT and returns the current User object."""
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.")
    user = db.query(User).filter(User.username == payload.get("sub")).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")
    return user


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, request.username, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password."
        )
    # Update last login timestamp
    user.last_login = datetime.now(timezone.utc)
    db.commit()

    token = create_access_token({"sub": user.username})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user={"username": user.username, "name": user.full_name, "role": user.role}
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
