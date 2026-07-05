from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class House(Base):
    __tablename__ = "houses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    location = Column(String)
    price = Column(Float)
    description = Column(Text)
    owner_name = Column(String)
    owner_email = Column(String)
    status = Column(String, default="pending")  # pending, approved, rejected
    submission_date = Column(DateTime(timezone=True), server_default=func.now())
    views = Column(Integer, default=0)
    # For photos, we can store URLs or file paths
    photo_urls = Column(Text)  # JSON string of URLs

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)          # new column added via ALTER TABLE
    hashed_password = Column(String)   # legacy column kept for compatibility
    role = Column(String, default="tenant")
    bio = Column(Text, default="")
    phone = Column(String, default="")
    profile_pic = Column(Text, default="")
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())