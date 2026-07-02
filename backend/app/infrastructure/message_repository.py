from sqlalchemy.orm import Session
from typing import List, Optional
from .models import Message
from ..domain.models import MessageCreate
import uuid

class MessageRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, sender_id: str, message_in: MessageCreate) -> Message:
        db_msg = Message(
            id=str(uuid.uuid4()),
            sender_id=sender_id,
            recipient_id=message_in.recipient_id,
            property_id=message_in.property_id,
            content=message_in.content
        )
        self.db.add(db_msg)
        self.db.commit()
        self.db.refresh(db_msg)
        return db_msg

    def get_user_messages(self, user_id: str, skip: int = 0, limit: int = 50) -> List[Message]:
        return self.db.query(Message).filter(
            (Message.sender_id == user_id) | (Message.recipient_id == user_id)
        ).order_by(Message.created_at.desc()).offset(skip).limit(limit).all()

    def mark_as_read(self, message_id: str, user_id: str) -> bool:
        msg = self.db.query(Message).filter(
            Message.id == message_id, 
            Message.recipient_id == user_id
        ).first()
        
        if msg and not msg.is_read:
            msg.is_read = True
            self.db.commit()
            return True
        return False
