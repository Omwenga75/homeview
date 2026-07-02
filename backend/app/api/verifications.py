from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from ..domain.models import UserInDB, VerificationRequest, VerificationInDB, VerificationStatus
from .deps import get_current_active_user
import uuid
from datetime import datetime

router = APIRouter()

# In a real application, we would use a repository and a database session.
# For simplicity in this endpoint, we're mocking the DB operation just to show the architecture,
# but it should be connected to a VerificationRepository.

class AdminReview(BaseModel):
    status: VerificationStatus
    notes: Optional[str] = None

@router.post("/", response_model=VerificationInDB, status_code=status.HTTP_201_CREATED)
def submit_verification(
    request: VerificationRequest,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Submit documents for verification (Landlord/Caretaker).
    """
    if current_user.is_verified:
        raise HTTPException(status_code=400, detail="User is already verified")
        
    verification = VerificationInDB(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        status=VerificationStatus.PENDING,
        submitted_at=datetime.utcnow(),
        **request.dict()
    )
    # TODO: repo.save_verification(verification)
    return verification

@router.get("/status", response_model=VerificationInDB)
def get_verification_status(current_user: UserInDB = Depends(get_current_active_user)):
    """
    Get the status of the current user's verification request.
    """
    # TODO: return repo.get_verification_by_user(current_user.id)
    raise HTTPException(status_code=404, detail="No verification request found")

@router.patch("/{verification_id}/review", response_model=VerificationInDB)
def review_verification(
    verification_id: str,
    review: AdminReview,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Admin endpoint to approve or reject a verification request.
    """
    if current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to perform this action")
        
    # TODO: verification = repo.get_verification(verification_id)
    # verification.status = review.status
    # verification.admin_notes = review.notes
    # verification.reviewed_at = datetime.utcnow()
    # repo.update(verification)
    # If approved, repo.update_user_verification_status(user_id, True)
    
    # Returning a mock for now
    return VerificationInDB(
        id=verification_id,
        user_id="mock_user_id",
        id_number="mock_id",
        id_front_url="mock_url",
        selfie_url="mock_url",
        status=review.status,
        admin_notes=review.notes,
        submitted_at=datetime.utcnow(),
        reviewed_at=datetime.utcnow()
    )
