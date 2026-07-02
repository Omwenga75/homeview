from sqlalchemy.orm import Session
from typing import Optional, List
from .models import Property, Location, PropertyMedia, PropertyAmenity, Amenity
from ..domain.models import PropertyCreate
import uuid

class PropertyRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, property_id: str) -> Optional[Property]:
        return self.db.query(Property).filter(Property.id == property_id).first()

    def get_all(
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
    ) -> List[Property]:
        query = self.db.query(Property)
        
        if county or town or estate:
            query = query.join(Location)
        if county:
            query = query.filter(Location.county.ilike(f"%{county}%"))
        if town:
            query = query.filter(Location.town.ilike(f"%{town}%"))
        if estate:
            query = query.filter(Location.estate.ilike(f"%{estate}%"))
        if min_price is not None:
            query = query.filter(Property.price >= min_price)
        if max_price is not None:
            query = query.filter(Property.price <= max_price)
        if bedrooms is not None:
            query = query.filter(Property.bedrooms >= bedrooms)
        if bathrooms is not None:
            query = query.filter(Property.bathrooms >= bathrooms)
        if furnished is not None:
            query = query.filter(Property.furnished == furnished)
            
        # Default sort by newest
        query = query.order_by(Property.created_at.desc())
            
        return query.offset(skip).limit(limit).all()

    def create(self, property_in: PropertyCreate) -> Property:
        # First, ensure location exists or create it
        location = self.db.query(Location).filter(
            Location.county == property_in.location.county,
            Location.town == property_in.location.town,
            Location.estate == property_in.location.estate
        ).first()

        if not location:
            location = Location(
                county=property_in.location.county,
                town=property_in.location.town,
                estate=property_in.location.estate,
                latitude=property_in.location.latitude,
                longitude=property_in.location.longitude
            )
            self.db.add(location)
            self.db.commit()
            self.db.refresh(location)

        # Create Property
        db_property = Property(
            id=str(uuid.uuid4()),
            owner_id=property_in.owner_id,
            location_id=location.id,
            title=property_in.title,
            description=property_in.description,
            price=property_in.price,
            deposit=property_in.deposit,
            bedrooms=property_in.bedrooms,
            bathrooms=property_in.bathrooms,
            furnished=property_in.furnished,
            status=property_in.status.value
        )
        self.db.add(db_property)
        self.db.commit()
        self.db.refresh(db_property)

        # Handle Amenities
        if property_in.amenities:
            for amenity_name in property_in.amenities:
                amenity = self.db.query(Amenity).filter(Amenity.name == amenity_name).first()
                if not amenity:
                    amenity = Amenity(name=amenity_name)
                    self.db.add(amenity)
                    self.db.commit()
                    self.db.refresh(amenity)
                prop_amenity = PropertyAmenity(property_id=db_property.id, amenity_id=amenity.id)
                self.db.add(prop_amenity)

        # Handle Media
        if property_in.photo_urls:
            for i, url in enumerate(property_in.photo_urls):
                media = PropertyMedia(
                    property_id=db_property.id,
                    media_type="IMAGE",
                    url=url,
                    is_primary=(i == 0)
                )
                self.db.add(media)
        
        if property_in.video_urls:
            for url in property_in.video_urls:
                media = PropertyMedia(
                    property_id=db_property.id,
                    media_type="VIDEO",
                    url=url,
                    is_primary=False
                )
                self.db.add(media)

        self.db.commit()
        self.db.refresh(db_property)
        return db_property

    def delete(self, property_id: str) -> bool:
        db_property = self.get_by_id(property_id)
        if db_property:
            self.db.delete(db_property)
            self.db.commit()
            return True
        return False
