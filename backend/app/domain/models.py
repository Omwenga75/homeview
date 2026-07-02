from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class RoleEnum(str, Enum):
    GUEST = "guest"
    USER = "user"
    TENANT = "tenant"
    CARETAKER = "caretaker"
    LANDLORD = "landlord"
    AGENT = "agent"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class PropertyStatus(str, Enum):
    AVAILABLE = "available"
    RENTED = "rented"
    MAINTENANCE = "maintenance"
    UNAVAILABLE = "unavailable"
    PENDING_APPROVAL = "pending_approval"

class VerificationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    REQUIRES_MORE_INFO = "requires_more_info"

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: RoleEnum = RoleEnum.USER
    phone: Optional[str] = None
    bio: Optional[str] = None
    profile_pic: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: str
    joined_at: datetime
    is_active: bool = True
    is_verified: bool = False

class Location(BaseModel):
    county: str
    town: str
    estate: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class PropertyBase(BaseModel):
    title: str
    description: str
    price: float
    deposit: Optional[float] = None
    bedrooms: int
    bathrooms: int
    furnished: bool = False
    status: PropertyStatus = PropertyStatus.PENDING_APPROVAL
    location: Location
    amenities: List[str] = []
    photo_urls: List[str] = []
    video_urls: List[str] = []

class PropertyCreate(PropertyBase):
    owner_id: str

class PropertyInDB(PropertyBase):
    id: str
    owner_id: str
    created_at: datetime
    updated_at: datetime
    views: int = 0

class MessageBase(BaseModel):
    content: str
    recipient_id: str

class MessageCreate(MessageBase):
    property_id: Optional[str] = None

class MessageInDB(MessageBase):
    id: str
    sender_id: str
    property_id: Optional[str] = None
    created_at: datetime
    is_read: bool = False

class TransactionStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class PaymentInitiate(BaseModel):
    phone_number: str
    amount: float
    description: str
    property_id: Optional[str] = None

class TransactionInDB(BaseModel):
    id: str
    user_id: str
    property_id: Optional[str] = None
    amount: float
    phone_number: str
    checkout_request_id: str
    merchant_request_id: str
    status: TransactionStatus
    receipt_number: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class VerificationRequest(BaseModel):
    id_number: str
    id_front_url: str
    id_back_url: Optional[str] = None
    selfie_url: str
    business_registration_url: Optional[str] = None

class VerificationInDB(VerificationRequest):
    id: str
    user_id: str
    status: VerificationStatus
    admin_notes: Optional[str] = None
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None
