from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from pydantic_settings import BaseSettings
from typing import Generator

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./homeview_enterprise.db" # Default to sqlite, switch to postgres using env var

    class Config:
        env_file = ".env"

settings = Settings()

# Check if we are using sqlite for connect_args
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL, connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
