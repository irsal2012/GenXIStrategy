from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.api.api import api_router
from app.core.seed import seed_default_admin

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed default admin (development convenience)
# NOTE: Runs on startup; in production you should remove/disable this.
try:
    db = SessionLocal()
    seed_default_admin(db)
finally:
    db.close()

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    redirect_slashes=False
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    # IMPORTANT: Browsers send an OPTIONS preflight for our axios POSTs with Authorization.
    # If the app doesn't respond to OPTIONS, the browser blocks the request and you see 405.
    allow_methods=["*"],
    allow_headers=["*"],
    # Ensure preflight responses include required headers.
    max_age=600,
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "Welcome to CAIO AI Portfolio & Governance Platform",
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
