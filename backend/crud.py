from sqlalchemy.orm import Session
import models, schemas

def get_house(db: Session, house_id: int):
    return db.query(models.House).filter(models.House.id == house_id).first()

def get_houses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.House).offset(skip).limit(limit).all()

def create_house(db: Session, house: schemas.HouseCreate):
    db_house = models.House(**house.dict())
    db.add(db_house)
    db.commit()
    db.refresh(db_house)
    return db_house

def update_house(db: Session, house_id: int, house: schemas.HouseUpdate):
    db_house = db.query(models.House).filter(models.House.id == house_id).first()
    if db_house:
        for key, value in house.dict(exclude_unset=True).items():
            setattr(db_house, key, value)
        db.commit()
        db.refresh(db_house)
    return db_house

def delete_house(db: Session, house_id: int):
    db_house = db.query(models.House).filter(models.House.id == house_id).first()
    if db_house:
        db.delete(db_house)
        db.commit()
        return True
    return False

# User CRUD
def get_user(db: Session, user_id: str):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    import time
    db_user = models.User(
        id=str(int(time.time() * 1000)),
        name=user.name,
        email=user.email,
        password=user.password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: str, user: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        for key, value in user.dict(exclude_unset=True).items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def update_user_profile_pic(db: Session, user_id: str, profile_pic: str):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db_user.profile_pic = profile_pic
        db.commit()
        db.refresh(db_user)
    return db_user