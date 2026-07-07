from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, Response
from sqlalchemy.orm import Session
import models
import schemas
import crud
from database import engine, SessionLocal, get_db
from typing import List, Optional
import os

# Static files path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")


def render_html(filename: str):
    path = os.path.join(STATIC_DIR, filename)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    return f"<h1>{filename} not found!</h1>"


app = FastAPI(
    title="HomeView API",
    description="Backend for HomeView property management system",
    openapi_url="/openapi.json",
    docs_url="/docs"
)

@app.on_event("startup")
def startup_event():
    # Create tables and seed initial data
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed default admin if missing
        admin = crud.get_user(db, "admin_root")
        if not admin:
            db_admin = models.User(
                id="admin_root",
                name="Admin",
                email="admin@homeview.com",
                password="admin123",
                role="admin",
                bio="Global Platform Governance",
                phone="+254 700 000 000"
            )
            db.add(db_admin)
            db.commit()
            print("Seeded admin user.")

        # Seed sample approved houses if none exist
        existing_houses = db.query(models.House).filter(
            models.House.status == "approved"
        ).count()
        if existing_houses == 0:
            sample_houses = [
                models.House(
                    title="Emerald Luxury 2-Bedroom",
                    location="Westlands, Nairobi",
                    price=45000,
                    description="Experience luxury living in the heart of Westlands. This stunning 2-bedroom apartment features modern amenities, an open-concept living space, and breathtaking city views.",
                    owner_name="Nelson Omwenga",
                    owner_email="nelson@caretaker.com",
                    status="approved",
                    photo_urls="[]"
                ),
                models.House(
                    title="Modern Studio Apartment",
                    location="Kilimani, Nairobi",
                    price=25000,
                    description="A sleek, fully furnished studio in the heart of Kilimani. Perfect for young professionals looking for affordable luxury with great city connectivity.",
                    owner_name="Peris Wanjiku",
                    owner_email="peris@caretaker.com",
                    status="approved",
                    photo_urls="[]"
                ),
                models.House(
                    title="Sapphire Penthouse Suite",
                    location="Kileleshwa, Nairobi",
                    price=85000,
                    description="Live above it all in this spectacular penthouse with panoramic city views. Premium finishes, private terrace, and full concierge services included.",
                    owner_name="Nelson Omwenga",
                    owner_email="nelson@caretaker.com",
                    status="approved",
                    photo_urls="[]"
                ),
                models.House(
                    title="Garden View 1-Bedroom",
                    location="Lavington, Nairobi",
                    price=35000,
                    description="A warm and cozy 1-bedroom flat in the serene Lavington area. Features a private garden, modern kitchen, and secure underground parking.",
                    owner_name="Jane Doe",
                    owner_email="jane@caretaker.com",
                    status="approved",
                    photo_urls="[]"
                ),
                models.House(
                    title="Executive 3-Bedroom Townhouse",
                    location="Karen, Nairobi",
                    price=120000,
                    description="Expansive executive townhouse in the prestigious Karen suburb. Features 3 bedrooms, a private swimming pool, home office, and lush garden.",
                    owner_name="John Kamau",
                    owner_email="john@caretaker.com",
                    status="approved",
                    photo_urls="[]"
                ),
                models.House(
                    title="Bedsitter with Balcony",
                    location="Ruaka, Nairobi",
                    price=12000,
                    description="Affordable and comfortable bedsitter with a beautiful balcony overlooking the lush Ruaka hills. Perfect for students and young professionals.",
                    owner_name="Jane Doe",
                    owner_email="jane@caretaker.com",
                    status="approved",
                    photo_urls="[]"
                ),
            ]
            for house in sample_houses:
                db.add(house)
            db.commit()
            print("Seeded 6 sample approved houses.")
    except Exception as e:
        print(f"Startup error: {e}")
    finally:
        db.close()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── House API Routes ─────────────────────────────────────────────────────────

@app.post("/houses/", response_model=schemas.House)
@app.post("/houses", response_model=schemas.House)
async def create_house(house: schemas.HouseCreate, db: Session = Depends(get_db)):
    return crud.create_house(db=db, house=house)


@app.get("/houses/", response_model=List[schemas.House])
@app.get("/houses", response_model=List[schemas.House])
async def read_houses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    houses = crud.get_houses(db, skip=skip, limit=limit)
    return houses


@app.get("/houses/{house_id}", response_model=schemas.House)
async def read_house(house_id: int, db: Session = Depends(get_db)):
    db_house = crud.get_house(db, house_id=house_id)
    if db_house is None:
        raise HTTPException(status_code=404, detail="House not found")
    return db_house


@app.put("/houses/{house_id}", response_model=schemas.House)
async def update_house(house_id: int, house: schemas.HouseUpdate, db: Session = Depends(get_db)):
    db_house = crud.update_house(db, house_id=house_id, house=house)
    if db_house is None:
        raise HTTPException(status_code=404, detail="House not found")
    return db_house


@app.delete("/houses/{house_id}")
async def delete_house(house_id: int, db: Session = Depends(get_db)):
    success = crud.delete_house(db, house_id=house_id)
    if not success:
        raise HTTPException(status_code=404, detail="House not found")
    return {"message": "House deleted successfully"}


# ── Users API Routes ─────────────────────────────────────────────────────────

@app.get("/users/", response_model=List[schemas.User])
@app.get("/users", response_model=List[schemas.User])
async def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users


# ── Auth API Routes ──────────────────────────────────────────────────────────

@app.post("/auth/admin/users", response_model=schemas.User)
async def admin_create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)


@app.post("/auth/signup", response_model=schemas.User)
async def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)


@app.post("/auth/login")
async def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if not db_user or db_user.password != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "success": True,
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role,
            "bio": db_user.bio or "",
            "phone": db_user.phone or "",
            "profile_pic": db_user.profile_pic or "",
            "joined_at": str(db_user.joined_at) if db_user.joined_at else "",
        }
    }


@app.get("/auth/profile/{user_id}")
async def get_profile(user_id: str, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "success": True,
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role,
            "bio": db_user.bio or "",
            "phone": db_user.phone or "",
            "profile_pic": db_user.profile_pic or "",
            "joined_at": str(db_user.joined_at) if db_user.joined_at else "",
        }
    }


@app.put("/auth/profile/{user_id}")
async def update_profile(user_id: str, user: schemas.UserUpdate, db: Session = Depends(get_db)):
    db_user = crud.update_user(db, user_id=user_id, user=user)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "success": True,
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role,
            "bio": db_user.bio or "",
            "phone": db_user.phone or "",
            "profile_pic": db_user.profile_pic or "",
            "joined_at": str(db_user.joined_at) if db_user.joined_at else "",
        }
    }


@app.post("/auth/profile-pic/{user_id}")
async def update_profile_pic(user_id: str, profile_pic: schemas.ProfilePicUpdate, db: Session = Depends(get_db)):
    db_user = crud.update_user_profile_pic(db, user_id=user_id, profile_pic=profile_pic.profile_pic)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True}


@app.get("/api/stats")
async def get_stats(db: Session = Depends(get_db)):
    properties_count = db.query(models.House).filter(models.House.status == "approved").count()
    hosts_count = db.query(models.House.owner_email).filter(models.House.status == "approved").distinct().count()
    renters_count = db.query(models.User).filter(models.User.role == "tenant").count()
    
    return {
        "properties": properties_count,
        "hosts": hosts_count,
        "renters": renters_count,
        "rating": 4.9
    }


# For local development only: serve static files
if not os.environ.get("VERCEL"):
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")


# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
