from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class HouseBase(BaseModel):
    title: str
    location: str
    price: float
    description: str
    owner_name: str
    owner_email: str
    photo_urls: Optional[str] = None

class HouseCreate(HouseBase):
    pass

class HouseUpdate(BaseModel):
    title: Optional[str] = None
    location: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    status: Optional[str] = None
    photo_urls: Optional[str] = None

class House(HouseBase):
    id: int
    status: str
    submission_date: datetime
    views: int

    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    name: str
    email: str
    role: str = "tenant"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    profile_pic: Optional[str] = None

class ProfilePicUpdate(BaseModel):
    profile_pic: str

class User(UserBase):
    id: str
    bio: str
    phone: str
    profile_pic: str
    joined_at: datetime

    class Config:
        from_attributes = True