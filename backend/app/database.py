"""
database.py
-----------
Sets up the SQLAlchemy engine and session factory.

KEY CONCEPTS (beginner friendly):
  - Engine:       the connection to the SQLite file
  - SessionLocal: a factory that creates database sessions
  - Base:         the base class all our models inherit from
  - get_db():     a FastAPI dependency that opens a DB session per request
                  and closes it automatically when the request is done
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# connect_args is required for SQLite to work with FastAPI's async threads
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Each request gets its own session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# All models inherit from this Base
Base = declarative_base()


def get_db():
    """
    FastAPI dependency.
    Usage in a route:   db: Session = Depends(get_db)
    The 'yield' means FastAPI will close the session after the response is sent.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
