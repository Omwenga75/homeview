from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import auth, properties, messages, payments, verifications

app = FastAPI(
    title="HomeView Enterprise API",
    description="Modern robust API for the HomeView property rental platform",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Should be restricted in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(properties.router, prefix="/api/v1/properties", tags=["Properties"])
app.include_router(messages.router, prefix="/api/v1/messages", tags=["Messages"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])
app.include_router(verifications.router, prefix="/api/v1/verifications", tags=["Verifications"])

@app.get("/")
def root():
    return {"message": "Welcome to HomeView Enterprise API v2.0"}
