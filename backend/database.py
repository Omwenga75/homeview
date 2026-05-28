import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load environment variables from .env if present
load_dotenv(dotenv_path=Path(__file__).parent / '.env')

# PostgreSQL support via DATABASE_URL environment variable.
# If DATABASE_URL is not set, fall back to SQLite for local development.
SQLALCHEMY_DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///./homeview.db')

connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith('sqlite') else {}
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()