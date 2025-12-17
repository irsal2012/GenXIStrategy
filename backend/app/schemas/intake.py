from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.models.intake_form import AIType


class ParseTextRequest(BaseModel):
    text: str


class ParseTextResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class ValidateIntakeRequest(BaseModel):
    initiative_data: Dict[str, Any]


class ValidateIntakeResponse(BaseModel):
    success: bool
    missing_fields: List[Dict[str, str]]
    completeness_score: int
    suggestions: Optional[List[str]] = None


class ClassifyUseCaseRequest(BaseModel):
    title: str
    description: str
    business_objective: Optional[str] = None
    technologies: Optional[List[str]] = None


class ClassifyUseCaseResponse(BaseModel):
    success: bool
    ai_type: Optional[Dict[str, Any]] = None
    strategic_domain: Optional[Dict[str, Any]] = None
    business_function: Optional[Dict[str, Any]] = None
    risk_tier: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class FindSimilarRequest(BaseModel):
    title: str
    description: str
    business_objective: Optional[str] = None
    ai_type: Optional[str] = None
    technologies: Optional[List[str]] = None


class SimilarInitiative(BaseModel):
    id: int
    title: str
    similarity_score: int
    similarity_reasons: List[str]
    recommendation: str


class FindSimilarResponse(BaseModel):
    success: bool
    similar_initiatives: List[SimilarInitiative]
    error: Optional[str] = None


class IntakeFormTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    business_unit: Optional[str] = None
    ai_type: Optional[AIType] = None
    is_default: bool = False
    is_active: bool = True
    fields_config: Optional[Dict[str, Any]] = None


class IntakeFormTemplateCreate(IntakeFormTemplateBase):
    pass


class IntakeFormTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    business_unit: Optional[str] = None
    ai_type: Optional[AIType] = None
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None
    fields_config: Optional[Dict[str, Any]] = None


class IntakeFormTemplate(IntakeFormTemplateBase):
    id: int

    class Config:
        from_attributes = True
