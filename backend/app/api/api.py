from fastapi import APIRouter
from app.api.endpoints import auth, initiatives, analytics, intake, attachments, scoring, portfolio

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(initiatives.router, prefix="/initiatives", tags=["initiatives"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(intake.router, prefix="/intake", tags=["intake"])
api_router.include_router(attachments.router, prefix="/attachments", tags=["attachments"])
api_router.include_router(scoring.router, prefix="/scoring", tags=["scoring"])
api_router.include_router(portfolio.router, prefix="/portfolio", tags=["portfolio"])
