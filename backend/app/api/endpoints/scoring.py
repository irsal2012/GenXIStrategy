from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.scoring import (
    ScoringModelVersion, ScoringDimension, ScoringCriteria, InitiativeScore
)
from app.schemas.scoring import (
    ScoringModelVersion as ScoringModelVersionSchema,
    ScoringModelVersionCreate,
    ScoringModelVersionUpdate,
    ScoringDimension as ScoringDimensionSchema,
    ScoringDimensionCreate,
    ScoringDimensionUpdate,
    ScoringCriteria as ScoringCriteriaSchema,
    ScoringCriteriaCreate,
    ScoringCriteriaUpdate,
    InitiativeScore as InitiativeScoreSchema,
    CalculateScoreRequest,
    CalculateScoreResponse,
    RankingResponse
)
from app.services.scoring_service import ScoringService
from datetime import datetime

router = APIRouter()


# Scoring Model Version Endpoints
@router.get("/models", response_model=List[ScoringModelVersionSchema])
def get_scoring_models(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all scoring model versions."""
    models = db.query(ScoringModelVersion).offset(skip).limit(limit).all()
    return models


@router.get("/models/active", response_model=ScoringModelVersionSchema)
def get_active_scoring_model(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the currently active scoring model."""
    scoring_service = ScoringService(db)
    model = scoring_service.get_active_scoring_model()
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active scoring model found"
        )
    return model


@router.post("/models", response_model=ScoringModelVersionSchema)
def create_scoring_model(
    model_in: ScoringModelVersionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new scoring model version."""
    # Create model version
    model = ScoringModelVersion(
        name=model_in.name,
        description=model_in.description,
        version=model_in.version,
        value_weight=model_in.value_weight,
        feasibility_weight=model_in.feasibility_weight,
        risk_weight=model_in.risk_weight,
        strategic_alignment_weight=model_in.strategic_alignment_weight,
        created_by_id=current_user.id
    )
    db.add(model)
    db.flush()
    
    # Create dimensions if provided
    if model_in.dimensions:
        for dim_data in model_in.dimensions:
            dimension = ScoringDimension(
                model_version_id=model.id,
                dimension_type=dim_data.dimension_type,
                name=dim_data.name,
                description=dim_data.description,
                weight=dim_data.weight,
                color=dim_data.color,
                icon=dim_data.icon,
                order=dim_data.order
            )
            db.add(dimension)
            db.flush()
            
            # Create criteria if provided
            if dim_data.criteria:
                for crit_data in dim_data.criteria:
                    criteria = ScoringCriteria(
                        dimension_id=dimension.id,
                        name=crit_data.name,
                        description=crit_data.description,
                        criteria_type=crit_data.criteria_type,
                        weight=crit_data.weight,
                        min_value=crit_data.min_value,
                        max_value=crit_data.max_value,
                        is_inverted=crit_data.is_inverted,
                        calculation_formula=crit_data.calculation_formula,
                        data_source_field=crit_data.data_source_field,
                        order=crit_data.order,
                        help_text=crit_data.help_text
                    )
                    db.add(criteria)
    
    db.commit()
    db.refresh(model)
    return model


@router.put("/models/{model_id}", response_model=ScoringModelVersionSchema)
def update_scoring_model(
    model_id: int,
    model_in: ScoringModelVersionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a scoring model version."""
    model = db.query(ScoringModelVersion).filter(ScoringModelVersion.id == model_id).first()
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scoring model not found"
        )
    
    update_data = model_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(model, field, value)
    
    db.commit()
    db.refresh(model)
    return model


@router.put("/models/{model_id}/activate", response_model=ScoringModelVersionSchema)
def activate_scoring_model(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Activate a scoring model version (deactivates all others)."""
    model = db.query(ScoringModelVersion).filter(ScoringModelVersion.id == model_id).first()
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scoring model not found"
        )
    
    # Deactivate all other models
    db.query(ScoringModelVersion).update({"is_active": False})
    
    # Activate this model
    model.is_active = True
    model.activated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(model)
    return model


@router.delete("/models/{model_id}")
def delete_scoring_model(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a scoring model version."""
    model = db.query(ScoringModelVersion).filter(ScoringModelVersion.id == model_id).first()
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scoring model not found"
        )
    
    if model.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete active scoring model"
        )
    
    db.delete(model)
    db.commit()
    return {"message": "Scoring model deleted successfully"}


# Scoring Dimension Endpoints
@router.get("/dimensions", response_model=List[ScoringDimensionSchema])
def get_scoring_dimensions(
    model_version_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get scoring dimensions, optionally filtered by model version."""
    query = db.query(ScoringDimension)
    if model_version_id:
        query = query.filter(ScoringDimension.model_version_id == model_version_id)
    return query.all()


@router.post("/dimensions", response_model=ScoringDimensionSchema)
def create_scoring_dimension(
    dimension_in: ScoringDimensionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new scoring dimension."""
    dimension = ScoringDimension(**dimension_in.dict(exclude={"criteria"}))
    db.add(dimension)
    db.flush()
    
    # Create criteria if provided
    if dimension_in.criteria:
        for crit_data in dimension_in.criteria:
            criteria = ScoringCriteria(
                dimension_id=dimension.id,
                **crit_data.dict()
            )
            db.add(criteria)
    
    db.commit()
    db.refresh(dimension)
    return dimension


@router.put("/dimensions/{dimension_id}", response_model=ScoringDimensionSchema)
def update_scoring_dimension(
    dimension_id: int,
    dimension_in: ScoringDimensionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a scoring dimension."""
    dimension = db.query(ScoringDimension).filter(ScoringDimension.id == dimension_id).first()
    if not dimension:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scoring dimension not found"
        )
    
    update_data = dimension_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(dimension, field, value)
    
    db.commit()
    db.refresh(dimension)
    return dimension


# Scoring Criteria Endpoints
@router.post("/criteria", response_model=ScoringCriteriaSchema)
def create_scoring_criteria(
    criteria_in: ScoringCriteriaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new scoring criteria."""
    criteria = ScoringCriteria(**criteria_in.dict())
    db.add(criteria)
    db.commit()
    db.refresh(criteria)
    return criteria


@router.put("/criteria/{criteria_id}", response_model=ScoringCriteriaSchema)
def update_scoring_criteria(
    criteria_id: int,
    criteria_in: ScoringCriteriaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a scoring criteria."""
    criteria = db.query(ScoringCriteria).filter(ScoringCriteria.id == criteria_id).first()
    if not criteria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scoring criteria not found"
        )
    
    update_data = criteria_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(criteria, field, value)
    
    db.commit()
    db.refresh(criteria)
    return criteria


# Initiative Scoring Endpoints
@router.post("/calculate/{initiative_id}", response_model=CalculateScoreResponse)
async def calculate_initiative_score(
    initiative_id: int,
    request: Optional[CalculateScoreRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Calculate score for a specific initiative."""
    scoring_service = ScoringService(db)
    
    try:
        use_ai = request.use_ai if request else True
        manual_scores = request.manual_scores if request else None
        
        score = await scoring_service.calculate_initiative_score(
            initiative_id=initiative_id,
            user_id=current_user.id,
            use_ai=use_ai,
            manual_scores=manual_scores
        )
        
        return CalculateScoreResponse(
            success=True,
            score=score,
            message="Score calculated successfully"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error calculating score: {str(e)}"
        )


@router.post("/calculate-all")
async def calculate_all_scores(
    use_ai: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Recalculate scores for all initiatives."""
    scoring_service = ScoringService(db)
    results = await scoring_service.calculate_all_scores(current_user.id, use_ai)
    
    success_count = sum(1 for r in results if r["success"])
    return {
        "message": f"Calculated scores for {success_count}/{len(results)} initiatives",
        "results": results
    }


@router.get("/initiative/{initiative_id}/history", response_model=List[InitiativeScoreSchema])
def get_initiative_score_history(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get score history for an initiative."""
    scoring_service = ScoringService(db)
    history = scoring_service.get_initiative_score_history(initiative_id)
    return history


@router.get("/initiative/{initiative_id}/current", response_model=InitiativeScoreSchema)
def get_current_initiative_score(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current score for an initiative."""
    scoring_service = ScoringService(db)
    model = scoring_service.get_active_scoring_model()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active scoring model found"
        )
    
    score = db.query(InitiativeScore).filter(
        InitiativeScore.initiative_id == initiative_id,
        InitiativeScore.model_version_id == model.id
    ).first()
    
    if not score:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Score not found for this initiative"
        )
    
    return score


@router.get("/rankings", response_model=List[RankingResponse])
def get_portfolio_rankings(
    limit: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get ranked list of all initiatives."""
    scoring_service = ScoringService(db)
    rankings = scoring_service.get_portfolio_rankings(limit=limit)
    return rankings
