from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..infrastructure.database import get_db
from ..application.message_service import MessageService
from ..domain.models import MessageCreate, MessageInDB, UserInDB
from .deps import get_current_active_user

router = APIRouter()

def get_message_service(db: Session = Depends(get_db)) -> MessageService:
    return MessageService(db)

@router.post("/", response_model=MessageInDB, status_code=status.HTTP_201_CREATED)
def send_message(
    message_in: MessageCreate, 
    service: MessageService = Depends(get_message_service),
    current_user: UserInDB = Depends(get_current_active_user)
):
    return service.send_message(current_user.id, message_in)

@router.get("/", response_model=List[MessageInDB])
def get_user_messages(
    skip: int = 0, 
    limit: int = 50,
    service: MessageService = Depends(get_message_service),
    current_user: UserInDB = Depends(get_current_active_user)
):
    return service.get_messages(current_user.id, skip, limit)

@router.patch("/{message_id}/read", status_code=status.HTTP_204_NO_CONTENT)
def mark_message_read(
    message_id: str,
    service: MessageService = Depends(get_message_service),
    current_user: UserInDB = Depends(get_current_active_user)
):
    success = service.read_message(message_id, current_user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found or already read")
