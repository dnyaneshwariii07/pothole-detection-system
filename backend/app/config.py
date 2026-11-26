"""
config.py
---------
Loads all environment variables from the .env file using pydantic-settings.
Every other file imports `settings` from here — no hardcoded values anywhere.

HOW IT WORKS:
  pydantic-settings reads the .env file automatically.
  If a variable is missing, it raises an error immediately on startup
  so you know exactly what's misconfigured before any request hits.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./pothole_detection.db"

    # AWS S3
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str = "eu-north-1"
    S3_BUCKET_NAME: str = "pothole-detection-images79"

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Upload
    UPLOAD_FOLDER: str = "uploads"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


# Single instance used across the entire app
settings = Settings()
