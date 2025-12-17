from fastapi import APIRouter
from app.api.endpoints import auth, initiatives, analytics

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(initiatives.router, prefix="/initiatives", tags=["initiatives"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
