from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.initiative import Initiative
from app.models.intake_form import IntakeFormTemplate
from app.schemas.intake import (
    ParseTextRequest,
    ParseTextResponse,
    ValidateIntakeRequest,
    ValidateIntakeResponse,
    ClassifyUseCaseRequest,
    ClassifyUseCaseResponse,
    FindSimilarRequest,
    FindSimilarResponse,
    IntakeFormTemplateCreate,
    IntakeFormTemplateUpdate,
    IntakeFormTemplate as IntakeFormTemplateSchema
)
from app.services.openai_service import openai_service

router = APIRouter()


@router.post("/parse-text", response_model=ParseTextResponse)
async def parse_unstructured_text(
    request: ParseTextRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Parse unstructured text into structured initiative data using AI.
    """
    result = await openai_service.parse_unstructured_intake(request.text)
    
    if result["success"]:
        # Parse the JSON string response
        try:
            data = json.loads(result["data"])
            return ParseTextResponse(success=True, data=data)
        except json.JSONDecodeError:
            return ParseTextResponse(success=True, data={"raw": result["data"]})

    # Surface AI/provider errors to the client with an actionable message.
    # (The frontend previously showed a generic error because this returned HTTP 200.)
    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=result.get("error", "Failed to parse text")
    )


@router.post("/validate", response_model=ValidateIntakeResponse)
async def validate_intake_data(
    request: ValidateIntakeRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Validate intake data and detect missing fields using AI.
    """
    result = await openai_service.detect_missing_fields(request.initiative_data)
    
    if result["success"]:
        try:
            data = json.loads(result["data"])
            return ValidateIntakeResponse(
                success=True,
                missing_fields=data.get("missing_fields", []),
                completeness_score=data.get("completeness_score", 0),
                suggestions=data.get("suggestions")
            )
        except json.JSONDecodeError:
            return ValidateIntakeResponse(
                success=False,
                missing_fields=[],
                completeness_score=0
            )

    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=result.get("error", "Failed to validate intake data")
    )


@router.post("/classify", response_model=ClassifyUseCaseResponse)
async def classify_use_case(
    request: ClassifyUseCaseRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Automatically classify the AI use case based on description.
    """
    initiative_data = {
        "title": request.title,
        "description": request.description,
        "business_objective": request.business_objective,
        "technologies": request.technologies or []
    }
    
    result = await openai_service.classify_use_case(initiative_data)
    
    if result["success"]:
        try:
            data = json.loads(result["data"])
            return ClassifyUseCaseResponse(
                success=True,
                ai_type=data.get("ai_type"),
                strategic_domain=data.get("strategic_domain"),
                business_function=data.get("business_function"),
                risk_tier=data.get("risk_tier")
            )
        except json.JSONDecodeError:
            return ClassifyUseCaseResponse(success=False, error="Failed to parse classification")

    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=result.get("error", "Failed to classify use case")
    )


@router.post("/similar")
async def find_similar_initiatives(
    request: FindSimilarRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Find similar existing initiatives to detect duplicates or collaboration opportunities.
    """
    # Get all existing initiatives
    existing_initiatives = db.query(Initiative).all()
    
    # Convert to dict format for AI analysis
    initiatives_data = [
        {
            "id": init.id,
            "title": init.title,
            "description": init.description,
            "business_objective": init.business_objective,
            "ai_type": init.ai_type.value if init.ai_type else None,
            "technologies": init.technologies or []
        }
        for init in existing_initiatives
    ]
    
    new_initiative_data = {
        "title": request.title,
        "description": request.description,
        "business_objective": request.business_objective,
        "ai_type": request.ai_type,
        "technologies": request.technologies or []
    }
    
    result = await openai_service.find_similar_initiatives(new_initiative_data, initiatives_data)
    
    if result["success"]:
        try:
            data = json.loads(result["data"])
            return {
                "success": True,
                "similar_initiatives": data.get("similar_initiatives", [])
            }
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to parse similarity results"
            )

    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=result.get("error", "Failed to find similar initiatives")
    )


@router.get("/templates", response_model=List[IntakeFormTemplateSchema])
def get_form_templates(
    business_unit: str = None,
    ai_type: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get intake form templates, optionally filtered by business unit or AI type.
    """
    query = db.query(IntakeFormTemplate).filter(IntakeFormTemplate.is_active == True)
    
    if business_unit:
        query = query.filter(IntakeFormTemplate.business_unit == business_unit)
    
    if ai_type:
        query = query.filter(IntakeFormTemplate.ai_type == ai_type)
    
    templates = query.all()
    return templates


@router.post("/templates", response_model=IntakeFormTemplateSchema, status_code=status.HTTP_201_CREATED)
def create_form_template(
    template_in: IntakeFormTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new intake form template.
    """
    # Check if user has admin role (you may want to add role check here)
    
    template = IntakeFormTemplate(**template_in.model_dump())
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


@router.put("/templates/{template_id}", response_model=IntakeFormTemplateSchema)
def update_form_template(
    template_id: int,
    template_in: IntakeFormTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update an existing intake form template.
    """
    template = db.query(IntakeFormTemplate).filter(IntakeFormTemplate.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Update fields
    update_data = template_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)
    
    db.commit()
    db.refresh(template)
    return template


@router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_form_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete an intake form template.
    """
    template = db.query(IntakeFormTemplate).filter(IntakeFormTemplate.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    db.delete(template)
    db.commit()
    return None
