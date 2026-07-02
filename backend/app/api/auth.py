from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..infrastructure.database import get_db
from ..application.auth_service import AuthService, Token, LoginCredentials
from ..domain.models import UserCreate, UserInDB, RoleEnum
from .deps import get_current_active_user

router = APIRouter()

def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(db)

@router.post("/signup", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, service: AuthService = Depends(get_auth_service)):
    if user_in.role in [RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Cannot register as admin publicly"
        )
    return service.register_user(user_in)

@router.post("/login", response_model=Token)
def login(credentials: LoginCredentials, service: AuthService = Depends(get_auth_service)):
    return service.login_user(credentials)

@router.post("/admin/users", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
def create_user_by_admin(
    user_in: UserCreate, 
    service: AuthService = Depends(get_auth_service),
    current_user: UserInDB = Depends(get_current_active_user)
):
    if current_user.role not in [RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized to create users"
        )
    return service.register_user(user_in)
