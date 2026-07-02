from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

class DBPropertyStatus(enum.Enum):
    AVAILABLE = "available"
    RENTED = "rented"
    MAINTENANCE = "maintenance"
    UNAVAILABLE = "unavailable"
    PENDING_APPROVAL = "pending_approval"

class DBRoleEnum(enum.Enum):
    GUEST = "guest"
    USER = "user"
    CARETAKER = "caretaker"
    LANDLORD = "landlord"
    AGENT = "agent"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(DBRoleEnum), default=DBRoleEnum.USER, nullable=False)
    phone = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    profile_pic = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    joined_at = Column(DateTime, default=datetime.utcnow)

    properties = relationship("Property", back_populates="owner", cascade="all, delete-orphan")

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    county = Column(String, index=True, nullable=False)
    town = Column(String, index=True, nullable=False)
    estate = Column(String, index=True, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    properties = relationship("Property", back_populates="location")

class Property(Base):
    __tablename__ = "properties"

    id = Column(String, primary_key=True, index=True)
    owner_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="RESTRICT"), nullable=False)
    
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False, index=True)
    deposit = Column(Float, nullable=True)
    bedrooms = Column(Integer, nullable=False)
    bathrooms = Column(Integer, nullable=False)
    furnished = Column(Boolean, default=False)
    status = Column(Enum(DBPropertyStatus), default=DBPropertyStatus.PENDING_APPROVAL, index=True)
    
    views = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="properties")
    location = relationship("Location", back_populates="properties")
    amenities = relationship("PropertyAmenity", back_populates="property", cascade="all, delete-orphan")
    media = relationship("PropertyMedia", back_populates="property", cascade="all, delete-orphan")

class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, unique=True, index=True, nullable=False)

class PropertyAmenity(Base):
    __tablename__ = "property_amenities"

    property_id = Column(String, ForeignKey("properties.id", ondelete="CASCADE"), primary_key=True)
    amenity_id = Column(Integer, ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True)

    property = relationship("Property", back_populates="amenities")
    amenity = relationship("Amenity")

class MediaType(enum.Enum):
    IMAGE = "image"
    VIDEO = "video"
    VIRTUAL_TOUR = "virtual_tour"

class PropertyMedia(Base):
    __tablename__ = "property_media"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    property_id = Column(String, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    media_type = Column(Enum(MediaType), default=MediaType.IMAGE, nullable=False)
    url = Column(String, nullable=False)
    is_primary = Column(Boolean, default=False)

    property = relationship("Property", back_populates="media")

class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, index=True)
    sender_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recipient_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    property_id = Column(String, ForeignKey("properties.id", ondelete="SET NULL"), nullable=True)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    sender = relationship("User", foreign_keys=[sender_id])
    recipient = relationship("User", foreign_keys=[recipient_id])
    property = relationship("Property")
