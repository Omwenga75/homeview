from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from typing import Optional
from ..domain.models import UserInDB
from .deps import get_current_active_user
from ..infrastructure.payment_gateway import MpesaGateway
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
gateway = MpesaGateway()

class PaymentRequest(BaseModel):
    phone_number: str
    amount: int
    property_id: Optional[str] = None
    purpose: str = "Premium Service"

@router.post("/stkpush")
def initiate_payment(
    payment_req: PaymentRequest,
    current_user: UserInDB = Depends(get_current_active_user)
):
    try:
        account_ref = payment_req.property_id if payment_req.property_id else current_user.id
        
        response = gateway.initiate_stk_push(
            phone_number=payment_req.phone_number,
            amount=payment_req.amount,
            account_reference=f"HV-{account_ref[:10]}",
            transaction_desc=payment_req.purpose
        )
        return {"success": True, "data": response}
    except Exception as e:
        logger.error(f"Payment initiation failed for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initiate payment"
        )

@router.post("/webhook")
async def mpesa_webhook(request: Request):
    """
    Callback URL for Safaricom to post transaction results.
    Note: Safaricom sends POST requests without authentication headers typically,
    so we process it carefully and log it.
    """
    try:
        data = await request.json()
        logger.info(f"Mpesa Webhook Received: {data}")
        
        # Here we would parse the Body.stkCallback
        # Check ResultCode (0 means success)
        # Extract Receipt Number and Update Database
        
        return {"ResultCode": 0, "ResultDesc": "Accepted"}
    except Exception as e:
        logger.error(f"Error processing Mpesa Webhook: {e}")
        return {"ResultCode": 1, "ResultDesc": "Rejected"}
