from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from database import Base
import datetime


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
    submission_date = Column(DateTime, default=datetime.datetime.utcnow)
    views = Column(Integer, default=0)
    photo_urls = Column(Text)  # JSON string of URLs
    amenities = Column(Text, default="[]")  # JSON string of amenities


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="tenant")
    bio = Column(Text, default="")
    phone = Column(String, default="")
    profile_pic = Column(Text, default="")
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)
