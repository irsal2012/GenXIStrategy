from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # Application
    PROJECT_NAME: str = "CAIO AI Portfolio & Governance Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    BACKEND_CORS_ORIGINS: str = '["http://localhost:3000","http://localhost:3001","http://localhost:8000"]'
    
    @property
    def cors_origins(self) -> List[str]:
        return json.loads(self.BACKEND_CORS_ORIGINS)
    
    # OpenAI
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
