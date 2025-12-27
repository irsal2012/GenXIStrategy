from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.initiative import Initiative
from app.schemas.initiative import InitiativeCreate, InitiativeUpdate, Initiative as InitiativeSchema
from app.services.openai_service import openai_service
from app.services.semantic_search_service import semantic_search_service

router = APIRouter()


@router.get("/", response_model=List[InitiativeSchema])
def list_initiatives(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all initiatives."""
    initiatives = db.query(Initiative).offset(skip).limit(limit).all()
    return initiatives


@router.post("/", response_model=InitiativeSchema, status_code=status.HTTP_201_CREATED)
async def create_initiative(
    initiative_in: InitiativeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new initiative."""
    initiative = Initiative(
        **initiative_in.model_dump(),
        owner_id=current_user.id
    )
    db.add(initiative)
    db.commit()
    db.refresh(initiative)
    
    # Generate embedding for the new initiative
    try:
        initiative_data = {
            "id": initiative.id,
            "title": initiative.title,
            "description": initiative.description,
            "business_objective": initiative.business_objective or "",
            "ai_pattern": "",  # Will be populated when user goes through PMI-CPMAI workflow
            "status": ""
        }
        await semantic_search_service.add_or_update_initiative_embedding(initiative_data)
    except Exception as e:
        # Log error but don't fail the initiative creation
        print(f"Warning: Failed to generate embedding for initiative {initiative.id}: {str(e)}")
    
    return initiative


@router.get("/{initiative_id}", response_model=InitiativeSchema)
def get_initiative(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get initiative by ID."""
    initiative = db.query(Initiative).filter(Initiative.id == initiative_id).first()
    if not initiative:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Initiative not found"
        )
    return initiative


@router.put("/{initiative_id}", response_model=InitiativeSchema)
async def update_initiative(
    initiative_id: int,
    initiative_in: InitiativeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update an initiative."""
    initiative = db.query(Initiative).filter(Initiative.id == initiative_id).first()
    if not initiative:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Initiative not found"
        )
    
    # Update fields
    update_data = initiative_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(initiative, field, value)
    
    db.commit()
    db.refresh(initiative)
    
    # Regenerate embedding for the updated initiative
    try:
        initiative_data = {
            "id": initiative.id,
            "title": initiative.title,
            "description": initiative.description,
            "business_objective": initiative.business_objective or "",
            "ai_pattern": "",  # Will be populated when user goes through PMI-CPMAI workflow
            "status": ""
        }
        await semantic_search_service.add_or_update_initiative_embedding(initiative_data)
    except Exception as e:
        # Log error but don't fail the initiative update
        print(f"Warning: Failed to update embedding for initiative {initiative.id}: {str(e)}")
    
    return initiative


@router.delete("/{initiative_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_initiative(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete an initiative."""
    initiative = db.query(Initiative).filter(Initiative.id == initiative_id).first()
    if not initiative:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Initiative not found"
        )
    
    db.delete(initiative)
    db.commit()
    return None


@router.post("/{initiative_id}/analyze-risks")
async def analyze_initiative_risks(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Use OpenAI to analyze and suggest risks for an initiative."""
    initiative = db.query(Initiative).filter(Initiative.id == initiative_id).first()
    if not initiative:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Initiative not found"
        )
    
    # Prepare initiative data for analysis
    initiative_data = {
        "title": initiative.title,
        "description": initiative.description,
        "business_objective": initiative.business_objective,
        "technologies": initiative.technologies or []
    }
    
    # Call OpenAI service
    result = await openai_service.analyze_initiative_risks(initiative_data)
    
    return result


@router.post("/{initiative_id}/calculate-priority")
async def calculate_initiative_priority(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Use OpenAI to help calculate initiative priority."""
    initiative = db.query(Initiative).filter(Initiative.id == initiative_id).first()
    if not initiative:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Initiative not found"
        )
    
    # Prepare initiative data
    initiative_data = {
        "title": initiative.title,
        "description": initiative.description,
        "business_objective": initiative.business_objective,
        "expected_roi": initiative.expected_roi,
        "budget_allocated": initiative.budget_allocated
    }
    
    # Call OpenAI service
    result = await openai_service.calculate_initiative_priority(initiative_data)
    
    return result
