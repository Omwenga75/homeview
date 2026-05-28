from database import SessionLocal
from models import House

db = SessionLocal()
house = House(
    title='Test House',
    location='Nairobi, Kenya',
    price=25000,
    description='A beautiful test house',
    owner_name='Nelson Omwenga',
    owner_email='nelson@example.com',
    status='approved'
)
db.add(house)
db.commit()
db.refresh(house)
print('House added:', house.id)
db.close()