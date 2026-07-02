from sqlalchemy.orm import Session
from typing import Optional, List
from .models import User, DBRoleEnum
from ..domain.models import UserCreate
from .security import get_password_hash
import uuid

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def create(self, user_in: UserCreate) -> User:
        db_user = User(
            id=str(uuid.uuid4()),
            name=user_in.name,
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            role=DBRoleEnum(user_in.role.value),
            phone=user_in.phone,
            bio=user_in.bio,
            profile_pic=user_in.profile_pic
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def update(self, db_user: User, update_data: dict) -> User:
        for field, value in update_data.items():
            setattr(db_user, field, value)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
