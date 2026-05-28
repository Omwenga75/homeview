from database import SessionLocal
from models import House

db = SessionLocal()
houses = db.query(House).all()
with open('check_output.txt', 'w') as f:
    f.write(f'Total houses: {len(houses)}\n')
    for house in houses:
        f.write(f'ID: {house.id}, Title: {house.title}, Status: {house.status}\n')
print(f'Total houses: {len(houses)}')
for house in houses:
    print(f'ID: {house.id}, Title: {house.title}, Status: {house.status}')
db.close()