from sqlalchemy.orm import Session
from typing import List
from ..domain.models import MessageCreate, MessageInDB
from ..infrastructure.message_repository import MessageRepository

class MessageService:
    def __init__(self, db: Session):
        self.repo = MessageRepository(db)

    def send_message(self, sender_id: str, message_in: MessageCreate) -> MessageInDB:
        msg = self.repo.create(sender_id, message_in)
        return MessageInDB(
            id=msg.id,
            sender_id=msg.sender_id,
            recipient_id=msg.recipient_id,
            property_id=msg.property_id,
            content=msg.content,
            created_at=msg.created_at,
            is_read=msg.is_read
        )

    def get_messages(self, user_id: str, skip: int = 0, limit: int = 50) -> List[MessageInDB]:
        msgs = self.repo.get_user_messages(user_id, skip, limit)
        return [
            MessageInDB(
                id=msg.id,
                sender_id=msg.sender_id,
                recipient_id=msg.recipient_id,
                property_id=msg.property_id,
                content=msg.content,
                created_at=msg.created_at,
                is_read=msg.is_read
            ) for msg in msgs
        ]

    def read_message(self, message_id: str, user_id: str):
        return self.repo.mark_as_read(message_id, user_id)
