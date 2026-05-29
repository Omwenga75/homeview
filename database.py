from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Default to SQLite for local development, easily swappable to Postgres
# For Postgres, set the DATABASE_URL environment variable:
# e.g., export DATABASE_URL="postgresql://user:password@localhost/dbname"
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    if os.environ.get("VERCEL"):
        # On Vercel, if no Postgres is provided, use a temp SQLite file
        # Note: This will reset on every redeploy/cold start
        SQLALCHEMY_DATABASE_URL = "sqlite:////tmp/homeview.db"
    else:
        SQLALCHEMY_DATABASE_URL = "sqlite:///./homeview.db"
else:
    # Fix for newer SQLAlchemy/Heroku/Vercel Postgres strings
    SQLALCHEMY_DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite needs check_same_thread=False
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
