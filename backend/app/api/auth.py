from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..infrastructure.database import get_db
from ..application.auth_service import AuthService, Token, LoginCredentials
from ..domain.models import UserCreate, UserInDB

router = APIRouter()

def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(db)

@router.post("/signup", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, service: AuthService = Depends(get_auth_service)):
    return service.register_user(user_in)

@router.post("/login", response_model=Token)
def login(credentials: LoginCredentials, service: AuthService = Depends(get_auth_service)):
    return service.login_user(credentials)
