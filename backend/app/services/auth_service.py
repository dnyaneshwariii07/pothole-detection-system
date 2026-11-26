"""
auth_service.py
---------------
JWT token creation and password hashing.

HOW JWT WORKS:
  1. User sends username + password
  2. We verify the password hash
  3. We create a JWT token (a signed string) containing the username
  4. Frontend stores this token and sends it with every request
  5. We verify the token signature on each protected route
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from ..config import settings
from ..models.models import User

# bcrypt is used to hash passwords — never store plain text passwords
# Using sha256_crypt as primary with bcrypt as fallback for Python 3.14 compatibility
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_default_admin(db: Session):
    """
    Creates the default admin account if no users exist in the DB.
    Called once on startup.
    Credentials:  admin / admin123
    """
    existing = db.query(User).filter(User.username == "admin").first()
    if not existing:
        admin = User(
            username="admin",
            email="admin@cityroads.gov.in",
            hashed_password=hash_password("admin123"),
            full_name="Admin User",
            role="admin",
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print("✅ Default admin account created: admin / admin123")
