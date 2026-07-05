from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, crud
from database import SessionLocal, engine
from typing import List

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="HomeView API", description="Backend for HomeView property management system")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local frontend development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def startup_populate():
    db = SessionLocal()
    try:
        # Seed default admin if missing
        admin = crud.get_user(db, "admin_root")
        if not admin:
            db_admin = models.User(
                id="admin_root",
                name="Admin",
                email="admin@homeview.com",
                password="admin123", # Note: In production, hash this
                role="admin",
                bio="Global Platform Governance"
            )
            db.add(db_admin)
            db.commit()
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to HomeView API"}

@app.post("/houses/", response_model=schemas.House)
def create_house(house: schemas.HouseCreate, db: Session = Depends(get_db)):
    return crud.create_house(db=db, house=house)

@app.get("/houses/", response_model=List[schemas.House])
def read_houses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    houses = crud.get_houses(db, skip=skip, limit=limit)
    return houses

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    properties_count = db.query(models.House).count()
    hosts_count = db.query(models.User).filter(models.User.role == "caretaker").count()
    renters_count = db.query(models.User).filter(models.User.role == "tenant").count()
    return {
        "properties": properties_count,
        "hosts": hosts_count,
        "renters": renters_count,
        "rating": 4.9
    }

@app.get("/houses/{house_id}", response_model=schemas.House)
def read_house(house_id: int, db: Session = Depends(get_db)):
    db_house = crud.get_house(db, house_id=house_id)
    if db_house is None:
        raise HTTPException(status_code=404, detail="House not found")
    return db_house

@app.put("/houses/{house_id}", response_model=schemas.House)
def update_house(house_id: int, house: schemas.HouseUpdate, db: Session = Depends(get_db)):
    db_house = crud.update_house(db, house_id=house_id, house=house)
    if db_house is None:
        raise HTTPException(status_code=404, detail="House not found")
    return db_house

@app.delete("/houses/{house_id}")
def delete_house(house_id: int, db: Session = Depends(get_db)):
    success = crud.delete_house(db, house_id=house_id)
    if not success:
        raise HTTPException(status_code=404, detail="House not found")
    return {"message": "House deleted"}

# User Endpoints

@app.post("/auth/signup", response_model=schemas.User)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/auth/login", response_model=schemas.User)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if not db_user or (db_user.password != user.password and db_user.hashed_password != user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return db_user

@app.get("/auth/profile/{user_id}", response_model=schemas.User)
def get_profile(user_id: str, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.put("/auth/profile/{user_id}", response_model=schemas.User)
def update_profile(user_id: str, user: schemas.UserUpdate, db: Session = Depends(get_db)):
    db_user = crud.update_user(db, user_id=user_id, user=user)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.post("/auth/profile-pic/{user_id}")
def update_profile_pic(user_id: str, profile_pic: schemas.ProfilePicUpdate, db: Session = Depends(get_db)):
    db_user = crud.update_user_profile_pic(db, user_id=user_id, profile_pic=profile_pic.profile_pic)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True}