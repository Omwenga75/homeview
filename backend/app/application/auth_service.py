from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..domain.models import UserCreate, UserInDB
from ..infrastructure.user_repository import UserRepository
from ..infrastructure.security import verify_password, create_access_token
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserInDB

class LoginCredentials(BaseModel):
    email: str
    password: str

class AuthService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def register_user(self, user_in: UserCreate) -> UserInDB:
        existing_user = self.repo.get_by_email(user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        db_user = self.repo.create(user_in)
        return UserInDB(
            id=db_user.id,
            name=db_user.name,
            email=db_user.email,
            role=db_user.role.value,
            phone=db_user.phone,
            bio=db_user.bio,
            profile_pic=db_user.profile_pic,
            joined_at=db_user.joined_at,
            is_active=db_user.is_active,
            is_verified=db_user.is_verified
        )

    def login_user(self, credentials: LoginCredentials) -> Token:
        user = self.repo.get_by_email(credentials.email)
        if not user or not verify_password(credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        access_token = create_access_token(subject=user.id)
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=UserInDB(
                id=user.id,
                name=user.name,
                email=user.email,
                role=user.role.value,
                phone=user.phone,
                bio=user.bio,
                profile_pic=user.profile_pic,
                joined_at=user.joined_at,
                is_active=user.is_active,
                is_verified=user.is_verified
            )
        )
