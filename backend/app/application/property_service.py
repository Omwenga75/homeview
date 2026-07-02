from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..domain.models import PropertyCreate, PropertyInDB, Location
from ..infrastructure.property_repository import PropertyRepository
from typing import List, Optional

class PropertyService:
    def __init__(self, db: Session):
        self.repo = PropertyRepository(db)

    def get_all_properties(
        self, 
        skip: int = 0, 
        limit: int = 100,
        county: Optional[str] = None,
        town: Optional[str] = None,
        estate: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        bedrooms: Optional[int] = None,
        bathrooms: Optional[int] = None,
        furnished: Optional[bool] = None
    ) -> List[PropertyInDB]:
        db_properties = self.repo.get_all(
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
        result = []
        for p in db_properties:
            # Map DB model to Domain model
            location = Location(
                county=p.location.county,
                town=p.location.town,
                estate=p.location.estate,
                latitude=p.location.latitude,
                longitude=p.location.longitude
            )
            amenities = [a.amenity.name for a in p.amenities]
            photos = [m.url for m in p.media if m.media_type.value == "IMAGE"]
            videos = [m.url for m in p.media if m.media_type.value == "VIDEO"]

            result.append(PropertyInDB(
                id=p.id,
                owner_id=p.owner_id,
                title=p.title,
                description=p.description,
                price=p.price,
                deposit=p.deposit,
                bedrooms=p.bedrooms,
                bathrooms=p.bathrooms,
                furnished=p.furnished,
                status=p.status.value,
                location=location,
                amenities=amenities,
                photo_urls=photos,
                video_urls=videos,
                created_at=p.created_at,
                updated_at=p.updated_at,
                views=p.views
            ))
        return result

    def get_property(self, property_id: str) -> PropertyInDB:
        p = self.repo.get_by_id(property_id)
        if not p:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
        
        location = Location(
            county=p.location.county,
            town=p.location.town,
            estate=p.location.estate,
            latitude=p.location.latitude,
            longitude=p.location.longitude
        )
        amenities = [a.amenity.name for a in p.amenities]
        photos = [m.url for m in p.media if m.media_type.value == "IMAGE"]
        videos = [m.url for m in p.media if m.media_type.value == "VIDEO"]

        return PropertyInDB(
            id=p.id,
            owner_id=p.owner_id,
            title=p.title,
            description=p.description,
            price=p.price,
            deposit=p.deposit,
            bedrooms=p.bedrooms,
            bathrooms=p.bathrooms,
            furnished=p.furnished,
            status=p.status.value,
            location=location,
            amenities=amenities,
            photo_urls=photos,
            video_urls=videos,
            created_at=p.created_at,
            updated_at=p.updated_at,
            views=p.views
        )

    def create_property(self, property_in: PropertyCreate) -> PropertyInDB:
        p = self.repo.create(property_in)
        return self.get_property(p.id)

    def delete_property(self, property_id: str, current_user_id: str):
        p = self.repo.get_by_id(property_id)
        if not p:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
        
        if p.owner_id != current_user_id:
            # Here we could also check if user is admin
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this property")
            
        self.repo.delete(property_id)
        return {"success": True}
