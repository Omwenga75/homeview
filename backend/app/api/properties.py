from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..infrastructure.database import get_db
from ..application.property_service import PropertyService
from ..domain.models import PropertyCreate, PropertyInDB, UserInDB
from .deps import get_current_active_user

router = APIRouter()

def get_property_service(db: Session = Depends(get_db)) -> PropertyService:
    return PropertyService(db)

@router.get("/", response_model=List[PropertyInDB])
def get_properties(
    skip: int = 0, 
    limit: int = 100, 
    county: Optional[str] = None,
    town: Optional[str] = None,
    estate: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    bathrooms: Optional[int] = None,
    furnished: Optional[bool] = None,
    service: PropertyService = Depends(get_property_service)
):
    return service.get_all_properties(
        skip=skip, 
        limit=limit,
        county=county,
        town=town,
        estate=estate,
        min_price=min_price,
        max_price=max_price,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
        furnished=furnished
    )

@router.get("/{property_id}", response_model=PropertyInDB)
def get_property(property_id: str, service: PropertyService = Depends(get_property_service)):
    return service.get_property(property_id)

@router.post("/", response_model=PropertyInDB, status_code=status.HTTP_201_CREATED)
def create_property(
    property_in: PropertyCreate, 
    service: PropertyService = Depends(get_property_service),
    current_user: UserInDB = Depends(get_current_active_user)
):
    property_in.owner_id = current_user.id
    return service.create_property(property_in)

@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_property(
    property_id: str, 
    service: PropertyService = Depends(get_property_service),
    current_user: UserInDB = Depends(get_current_active_user)
):
    service.delete_property(property_id, current_user=current_user)
