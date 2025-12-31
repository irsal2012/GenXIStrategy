"""
API endpoints for Module 7 - AI Project Management
Complete AI project lifecycle from business understanding through deployment and monitoring
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.ai_project import (
    # Business Understanding
    BusinessUnderstanding, BusinessUnderstandingCreate, BusinessUnderstandingUpdate,
    # Data Understanding
    DataUnderstanding, DataUnderstandingCreate, DataUnderstandingUpdate,
    # Data Preparation
    DataPreparation, DataPreparationCreate, DataPreparationUpdate,
    # Model Development
    ModelDevelopment, ModelDevelopmentCreate, ModelDevelopmentUpdate,
    # Model Evaluation
    ModelEvaluation, ModelEvaluationCreate, ModelEvaluationUpdate,
    # Model Deployment
    ModelDeployment, ModelDeploymentCreate, ModelDeploymentUpdate,
    # Model Monitoring
    ModelMonitoring, ModelMonitoringCreate,
    # AI Agent Requests/Responses
    AIFeasibilityAnalysisRequest, AIFeasibilityAnalysisResponse,
    AIDataQualityRequest, AIDataQualityResponse,
    AIHyperparameterRequest, AIHyperparameterResponse,
    AIModelInterpretationRequest, AIModelInterpretationResponse,
    AIDriftDetectionRequest, AIDriftDetectionResponse,
    # Dashboard
    ProjectOverviewDashboard, PhaseProgressSummary
)
from app.services.ai_project_service import AIProjectService
from app.agents.ai_project_manager_agent import AIProjectManagerAgent
from app.services.ai_go_no_go_service import normalize_assessment
from app.services.semantic_search_service import semantic_search_service
from app.models.initiative import Initiative
from app.models.ai_project import BusinessUnderstanding as BusinessUnderstandingModel

router = APIRouter()


from pydantic import BaseModel
from typing import Dict, Any


class AIGoNoGoPrefillRequest(BaseModel):
    initiative_id: int
    continuation_context: Optional[Dict[str, Any]] = None
    business_objectives: Optional[str] = None
    data_sources: Optional[List[Dict[str, Any]]] = None
    compliance_requirements: Optional[List[str]] = None


class AIGoNoGoSaveRequest(BaseModel):
    ai_go_no_go_assessment: Dict[str, Any]


# ============================================================================
# PMI-CPMAI Workflow Endpoints
# ============================================================================

@router.post("/pmi-cpmai/classify-pattern", response_model=dict)
async def classify_ai_pattern(
    business_problem: str,
    current_user: User = Depends(get_current_user)
):
    """
    Classify business problem into one of PMI's 7 AI patterns.
    Step 2 of PMI-CPMAI workflow.
    """
    try:
        from app.services.openai_service import openai_service
        # Use the openai_service which has the client and model configured
        from openai import OpenAI
        from app.core.config import settings
        
        client = OpenAI(api_key=settings.openai_api_key)
        agent = AIProjectManagerAgent(client, settings.OPENAI_MODEL)
        result = await agent.classify_ai_pattern(business_problem)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pmi-cpmai/find-similar-initiatives", response_model=dict)
async def find_similar_initiatives(
    business_problem: str,
    ai_pattern: Optional[str] = None,
    status_filter: Optional[List[str]] = Query(default=None),
    top_k: int = Query(default=10, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Find similar initiatives using semantic search.
    If ai_pattern is provided, filters by pattern first, then ranks by similarity.
    Step 3 of PMI-CPMAI workflow.
    """
    try:
        # NEW: If pattern is provided, use pattern-filtered search
        if ai_pattern:
            similar_initiatives = await semantic_search_service.find_similar_initiatives_by_pattern(
                query_text=business_problem,
                ai_pattern=ai_pattern,
                top_k=top_k,
                status_filter=status_filter,
                min_similarity=0.3
            )
        else:
            # Original behavior: search all initiatives
            similar_initiatives = await semantic_search_service.find_similar_initiatives(
                query_text=business_problem,
                top_k=top_k,
                status_filter=status_filter,
                min_similarity=0.3
            )
        
        # If too few results, try fallback keyword search
        if len(similar_initiatives) < 3:
            # Get all initiatives from database
            all_initiatives = db.query(Initiative).all()
            
            initiatives_dict = [
                {
                    "id": init.id,
                    "title": init.title,
                    "description": init.description,
                    "business_objective": init.business_objective,
                    "ai_pattern": "",
                    "status": None
                }
                for init in all_initiatives
            ]
            
            keyword_results = semantic_search_service.fallback_keyword_search(
                query_text=business_problem,
                initiatives=initiatives_dict,
                top_k=top_k
            )

            # Enrich keyword fallback results with full initiative data too
            keyword_ids = [r.get("initiative_id") for r in keyword_results if r.get("initiative_id") is not None]
            full_keyword_inits = db.query(Initiative).filter(Initiative.id.in_(keyword_ids)).all() if keyword_ids else []
            keyword_lookup = {init.id: init for init in full_keyword_inits}

            enriched_keyword_results = []
            for r in keyword_results:
                init_id = r.get("initiative_id")
                full_init = keyword_lookup.get(init_id)
                if full_init:
                    enriched_keyword_results.append({
                        **r,
                        "owner_id": full_init.owner_id,
                        "priority": full_init.priority.value if full_init.priority else None,
                        "budget_allocated": full_init.budget_allocated,
                        "expected_roi": full_init.expected_roi,
                        "business_value_score": full_init.business_value_score,
                        "technical_feasibility_score": full_init.technical_feasibility_score,
                        "strategic_alignment_score": full_init.strategic_alignment_score,
                    })
                else:
                    enriched_keyword_results.append(r)
            
            return {
                "success": True,
                "data": {
                    "initiatives": enriched_keyword_results,
                    "search_method": "keyword",
                    "total_found": len(enriched_keyword_results),
                    "message": "Using keyword search (semantic search returned too few results)"
                }
            }
        
        # Enrich with full initiative data from database
        initiative_ids = [init["initiative_id"] for init in similar_initiatives]
        full_initiatives = db.query(Initiative).filter(Initiative.id.in_(initiative_ids)).all()
        
        # Create lookup dict
        initiative_lookup = {init.id: init for init in full_initiatives}
        
        # Enrich results
        enriched_results = []
        for sim_init in similar_initiatives:
            init_id = sim_init["initiative_id"]
            if init_id in initiative_lookup:
                full_init = initiative_lookup[init_id]
                enriched_results.append({
                    **sim_init,
                    "owner_id": full_init.owner_id,
                    "priority": full_init.priority.value if full_init.priority else None,
                    "budget_allocated": full_init.budget_allocated,
                    "expected_roi": full_init.expected_roi,
                    "business_value_score": full_init.business_value_score,
                    "technical_feasibility_score": full_init.technical_feasibility_score,
                    "strategic_alignment_score": full_init.strategic_alignment_score
                })
        
        return {
            "success": True,
            "data": {
                "initiatives": enriched_results,
                "search_method": "semantic",
                "total_found": len(enriched_results)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pmi-cpmai/recommend-initiative", response_model=dict)
async def recommend_best_initiative(
    business_problem: str,
    ai_pattern: str,
    similar_initiatives: List[dict],
    current_user: User = Depends(get_current_user)
):
    """
    Get AI recommendation for best matching initiative.
    Step 4 of PMI-CPMAI workflow.
    """
    try:
        from openai import OpenAI
        from app.core.config import settings
        
        client = OpenAI(api_key=settings.openai_api_key)
        agent = AIProjectManagerAgent(client, settings.OPENAI_MODEL)
        result = await agent.recommend_best_initiative(
            business_problem=business_problem,
            ai_pattern=ai_pattern,
            similar_initiatives=similar_initiatives
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pmi-cpmai/link-business-understanding", response_model=BusinessUnderstanding)
async def link_business_understanding_to_initiative(
    initiative_id: int,
    business_problem_text: str,
    ai_pattern: str,
    ai_pattern_confidence: float,
    ai_pattern_reasoning: str,
    pattern_override: bool = False,
    similar_initiatives_found: Optional[List[dict]] = None,
    ai_recommended_initiative_id: Optional[int] = None,
    ai_recommendation_reasoning: Optional[str] = None,
    # NOTE: We accept selected_use_case from request body JSON
    payload: Optional[dict] = Body(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create or update business understanding with PMI-CPMAI workflow data.
    Final step of PMI-CPMAI workflow - links problem to selected initiative.
    """
    try:
        import logging
        logger = logging.getLogger(__name__)
        
        selected_use_case: Optional[dict] = None
        
        # Debug logging
        logger.info(f"[link-business-understanding] Received payload: {payload}")
        logger.info(f"[link-business-understanding] Payload type: {type(payload)}")
        
        # The payload IS the selected use case object directly
        # Frontend sends: axios.post(url, selectedUseCase || null, {params: {...}})
        if payload and isinstance(payload, dict):
            # Check if it's a use case object (has title field)
            if 'title' in payload:
                selected_use_case = payload
                logger.info(f"[link-business-understanding] Extracted use case from payload: {selected_use_case.get('title')}")
            # Or if it's wrapped in selected_use_case key
            elif 'selected_use_case' in payload and isinstance(payload['selected_use_case'], dict):
                selected_use_case = payload['selected_use_case']
                logger.info(f"[link-business-understanding] Extracted use case from wrapped payload: {selected_use_case.get('title')}")
            else:
                logger.warning(f"[link-business-understanding] Payload has no 'title' field. Keys: {list(payload.keys())}")
        else:
            logger.info(f"[link-business-understanding] No payload or payload is not a dict")

        # Check if business understanding already exists
        existing = AIProjectService.get_business_understanding_by_initiative(db, initiative_id)
        
        if existing:
            # Update existing - DIRECTLY update the database object
            logger.info(f"[link-business-understanding] Updating existing business understanding ID: {existing.id}")
            logger.info(f"[link-business-understanding] Before update - selected_use_case: {existing.selected_use_case}")
            
            existing.business_problem_text = business_problem_text
            existing.ai_pattern = ai_pattern
            existing.ai_pattern_confidence = ai_pattern_confidence
            existing.ai_pattern_reasoning = ai_pattern_reasoning
            existing.pattern_override = pattern_override
            existing.similar_initiatives_found = similar_initiatives_found
            existing.ai_recommended_initiative_id = ai_recommended_initiative_id
            existing.ai_recommendation_reasoning = ai_recommendation_reasoning
            
            # IMPORTANT: Explicitly set selected_use_case
            if selected_use_case:
                existing.selected_use_case = selected_use_case
                logger.info(f"[link-business-understanding] Setting selected_use_case to: {selected_use_case}")
            else:
                logger.warning(f"[link-business-understanding] selected_use_case is None or empty!")
            
            existing.updated_at = datetime.utcnow()
            
            # Mark the field as modified to ensure SQLAlchemy updates it
            from sqlalchemy.orm.attributes import flag_modified
            flag_modified(existing, "selected_use_case")
            
            db.commit()
            db.refresh(existing)
            logger.info(f"[link-business-understanding] After update - selected_use_case: {existing.selected_use_case}")
            return existing
        else:
            # Create new
            logger.info(f"[link-business-understanding] Creating new business understanding for initiative {initiative_id}")
            from app.schemas.ai_project import BusinessUnderstandingCreate
            business_understanding_data = BusinessUnderstandingCreate(
                initiative_id=initiative_id,
                business_problem_text=business_problem_text,
                ai_pattern=ai_pattern,
                ai_pattern_confidence=ai_pattern_confidence,
                ai_pattern_reasoning=ai_pattern_reasoning,
                pattern_override=pattern_override,
                similar_initiatives_found=similar_initiatives_found,
                ai_recommended_initiative_id=ai_recommended_initiative_id,
                ai_recommendation_reasoning=ai_recommendation_reasoning,
                selected_use_case=selected_use_case
            )
            result = AIProjectService.create_business_understanding(db, business_understanding_data, current_user.id)
            logger.info(f"[link-business-understanding] Created. selected_use_case saved: {result.selected_use_case}")
            return result
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"[link-business-understanding] Error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pmi-cpmai/generate-tactical-use-cases", response_model=dict)
async def generate_tactical_use_cases(
    business_problem: str,
    ai_pattern: str,
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate tactical use cases based on business problem, AI pattern, and initiative.
    Step 3.5 of PMI-CPMAI workflow.
    """
    try:
        # Basic request validation (prevents ambiguous 500s)
        if not business_problem or len(business_problem.strip()) < 10:
            raise HTTPException(status_code=422, detail="business_problem must be at least 10 characters")
        if not ai_pattern or not ai_pattern.strip():
            raise HTTPException(status_code=422, detail="ai_pattern is required")

        # Get initiative details
        initiative = db.query(Initiative).filter(Initiative.id == initiative_id).first()
        if not initiative:
            raise HTTPException(status_code=404, detail="Initiative not found")
        
        # Define PMI_PATTERNS locally (same as frontend)
        PMI_PATTERNS = [
            {
                "name": "Hyperpersonalization",
                "examples": ["Personalized product recommendations", "Customized content feeds", "Individual treatment plans"]
            },
            {
                "name": "Conversational & Human Interaction",
                "examples": ["Customer service chatbots", "Virtual assistants", "Language translation", "Content generation"]
            },
            {
                "name": "Recognition",
                "examples": ["Image recognition", "Speech-to-text", "OCR", "Facial recognition"]
            },
            {
                "name": "Pattern & Anomaly Detection",
                "examples": ["Fraud detection", "Quality control", "Network intrusion detection", "Equipment failure prediction"]
            },
            {
                "name": "Predictive Analytics & Decision Support",
                "examples": ["Sales forecasting", "Churn prediction", "Demand planning", "Risk assessment"]
            },
            {
                "name": "Goal-Driven Systems",
                "examples": ["Game AI", "Resource optimization", "Dynamic pricing", "Route optimization"]
            },
            {
                "name": "Autonomous Systems",
                "examples": ["Self-driving vehicles", "Autonomous drones", "Robotic process automation", "Smart manufacturing"]
            }
        ]
        
        pattern_meta = next((p for p in PMI_PATTERNS if p["name"] == ai_pattern), None)
        pattern_examples = pattern_meta["examples"] if pattern_meta else []

        if not pattern_examples:
            # Not fatal, but helps prompt quality and debugging if pattern names drift.
            import logging
            logging.getLogger(__name__).warning(
                "Unknown ai_pattern '%s' - continuing with empty pattern_examples", ai_pattern
            )
        
        # Prepare initiative details
        initiative_details = {
            "title": initiative.title,
            "description": initiative.description,
            "business_objective": initiative.business_objective,
            "status": None
        }
        
        # Generate use cases using AI
        from openai import OpenAI
        from app.core.config import settings

        # Hard fail early if API key is missing rather than returning confusing "NoneType" errors.
        if not getattr(settings, "openai_api_key", None):
            raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not configured")

        client = OpenAI(api_key=settings.openai_api_key)
        agent = AIProjectManagerAgent(client, settings.OPENAI_MODEL)

        result = await agent.generate_tactical_use_cases(
            business_problem=business_problem,
            ai_pattern=ai_pattern,
            initiative_details=initiative_details,
            pattern_examples=pattern_examples,
        )

        # Ensure frontend gets an HTTP error when the agent failed.
        if not result.get("success"):
            raise HTTPException(status_code=502, detail=result.get("error", "Failed to generate tactical use cases"))

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pmi-cpmai/submit-no-match-feedback")
async def submit_no_match_feedback(
    business_problem_text: str,
    ai_pattern: str,
    feedback_text: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit feedback when user finds no matching initiatives.
    This can be used for admin review and future initiative creation.
    """
    try:
        # For now, just log it. In future, could store in a feedback table
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"No-match feedback from user {current_user.id}: {feedback_text}")
        logger.info(f"Business problem: {business_problem_text}")
        logger.info(f"AI Pattern: {ai_pattern}")
        
        return {
            "success": True,
            "message": "Feedback submitted successfully. An administrator will review your request."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pmi-cpmai/rebuild-embeddings")
async def rebuild_all_embeddings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Rebuild all initiative embeddings.
    Admin endpoint for maintenance.
    """
    try:
        # Get all initiatives
        all_initiatives = db.query(Initiative).all()
        
        initiatives_data = [
            {
                "id": init.id,
                "title": init.title,
                "description": init.description,
                "ai_pattern": "",  # Will be populated as initiatives go through workflow
                "status": ""
            }
            for init in all_initiatives
        ]
        
        await semantic_search_service.rebuild_all_embeddings(initiatives_data)
        
        return {
            "success": True,
            "message": f"Successfully rebuilt embeddings for {len(initiatives_data)} initiatives"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Business Understanding Endpoints
# ============================================================================

@router.post("/business-understanding", response_model=BusinessUnderstanding)
async def create_business_understanding(
    business_understanding: BusinessUnderstandingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create business understanding for an initiative"""
    try:
        # Check if business understanding already exists for this initiative
        existing = AIProjectService.get_business_understanding_by_initiative(db, business_understanding.initiative_id)
        if existing:
            raise HTTPException(status_code=400, detail="Business understanding already exists for this initiative")
        
        return AIProjectService.create_business_understanding(db, business_understanding, current_user.id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/business-understanding/initiative/{initiative_id}", response_model=BusinessUnderstanding)
async def get_business_understanding_by_initiative(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get business understanding for an initiative"""
    business_understanding = AIProjectService.get_business_understanding_by_initiative(db, initiative_id)
    if not business_understanding:
        raise HTTPException(status_code=404, detail="Business understanding not found")
    return business_understanding


@router.put("/business-understanding/{business_understanding_id}", response_model=BusinessUnderstanding)
async def update_business_understanding(
    business_understanding_id: int,
    business_understanding_update: BusinessUnderstandingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update business understanding"""
    updated = AIProjectService.update_business_understanding(db, business_understanding_id, business_understanding_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Business understanding not found")
    return updated


@router.post("/business-understanding/{business_understanding_id}/go-no-go", response_model=BusinessUnderstanding)
async def record_go_no_go_decision(
    business_understanding_id: int,
    # NOTE: Frontend sends JSON body: { decision, decision_rationale }
    # Accept body to avoid silent no-op / 422 from mismatched params.
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record Go/No-Go decision"""
    decision = (payload or {}).get("decision")
    rationale = (payload or {}).get("decision_rationale") or (payload or {}).get("rationale")

    if decision not in ("go", "no_go"):
        raise HTTPException(status_code=422, detail="decision must be 'go' or 'no_go'")
    if not rationale or not str(rationale).strip():
        raise HTTPException(status_code=422, detail="decision_rationale is required")

    updated = AIProjectService.record_go_no_go_decision(
        db, business_understanding_id, decision, str(rationale), current_user.id
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Business understanding not found")
    return updated


# ============================================================================
# Data Understanding Endpoints
# ============================================================================

@router.post("/data-understanding", response_model=DataUnderstanding)
async def create_data_understanding(
    data_understanding: DataUnderstandingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create data understanding record"""
    try:
        return AIProjectService.create_data_understanding(db, data_understanding, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/data-understanding/initiative/{initiative_id}", response_model=List[DataUnderstanding])
async def get_data_understanding_by_initiative(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all data understanding records for an initiative"""
    return AIProjectService.get_data_understanding_by_initiative(db, initiative_id)


@router.get("/data-understanding/{data_understanding_id}", response_model=DataUnderstanding)
async def get_data_understanding(
    data_understanding_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific data understanding record"""
    data_understanding = AIProjectService.get_data_understanding(db, data_understanding_id)
    if not data_understanding:
        raise HTTPException(status_code=404, detail="Data understanding not found")
    return data_understanding


@router.put("/data-understanding/{data_understanding_id}", response_model=DataUnderstanding)
async def update_data_understanding(
    data_understanding_id: int,
    data_understanding_update: DataUnderstandingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update data understanding"""
    updated = AIProjectService.update_data_understanding(db, data_understanding_id, data_understanding_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Data understanding not found")
    return updated


# ============================================================================
# Data Preparation Endpoints
# ============================================================================

@router.post("/data-preparation", response_model=DataPreparation)
async def create_data_preparation(
    data_preparation: DataPreparationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create data preparation step"""
    try:
        return AIProjectService.create_data_preparation(db, data_preparation, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/data-preparation/initiative/{initiative_id}", response_model=List[DataPreparation])
async def get_data_preparation_by_initiative(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all data preparation steps for an initiative"""
    return AIProjectService.get_data_preparation_by_initiative(db, initiative_id)


@router.get("/data-preparation/{data_preparation_id}", response_model=DataPreparation)
async def get_data_preparation(
    data_preparation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific data preparation step"""
    data_preparation = AIProjectService.get_data_preparation(db, data_preparation_id)
    if not data_preparation:
        raise HTTPException(status_code=404, detail="Data preparation not found")
    return data_preparation


@router.put("/data-preparation/{data_preparation_id}", response_model=DataPreparation)
async def update_data_preparation(
    data_preparation_id: int,
    data_preparation_update: DataPreparationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update data preparation step"""
    updated = AIProjectService.update_data_preparation(db, data_preparation_id, data_preparation_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Data preparation not found")
    return updated


# ============================================================================
# Model Development Endpoints
# ============================================================================

@router.post("/models", response_model=ModelDevelopment)
async def create_model(
    model: ModelDevelopmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create model development record"""
    try:
        return AIProjectService.create_model(db, model, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models/initiative/{initiative_id}", response_model=List[ModelDevelopment])
async def get_models_by_initiative(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all models for an initiative"""
    return AIProjectService.get_models_by_initiative(db, initiative_id)


@router.get("/models/{model_id}", response_model=ModelDevelopment)
async def get_model(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific model"""
    model = AIProjectService.get_model(db, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return model


@router.put("/models/{model_id}", response_model=ModelDevelopment)
async def update_model(
    model_id: int,
    model_update: ModelDevelopmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update model"""
    updated = AIProjectService.update_model(db, model_id, model_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Model not found")
    return updated


@router.post("/models/{model_id}/start-training", response_model=ModelDevelopment)
async def start_model_training(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start model training"""
    updated = AIProjectService.start_training(db, model_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Model not found")
    return updated


@router.post("/models/{model_id}/complete-training", response_model=ModelDevelopment)
async def complete_model_training(
    model_id: int,
    final_metrics: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Complete model training"""
    updated = AIProjectService.complete_training(db, model_id, final_metrics)
    if not updated:
        raise HTTPException(status_code=404, detail="Model not found")
    return updated


# ============================================================================
# Model Evaluation Endpoints
# ============================================================================

@router.post("/evaluations", response_model=ModelEvaluation)
async def create_evaluation(
    evaluation: ModelEvaluationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create model evaluation"""
    try:
        return AIProjectService.create_evaluation(db, evaluation, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/evaluations/model/{model_id}", response_model=List[ModelEvaluation])
async def get_evaluations_by_model(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all evaluations for a model"""
    return AIProjectService.get_evaluations_by_model(db, model_id)


@router.get("/evaluations/{evaluation_id}", response_model=ModelEvaluation)
async def get_evaluation(
    evaluation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific evaluation"""
    evaluation = AIProjectService.get_evaluation(db, evaluation_id)
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return evaluation


@router.put("/evaluations/{evaluation_id}", response_model=ModelEvaluation)
async def update_evaluation(
    evaluation_id: int,
    evaluation_update: ModelEvaluationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update evaluation"""
    updated = AIProjectService.update_evaluation(db, evaluation_id, evaluation_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return updated


@router.post("/evaluations/{evaluation_id}/approve", response_model=ModelEvaluation)
async def approve_evaluation_for_deployment(
    evaluation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Approve model for deployment"""
    updated = AIProjectService.approve_for_deployment(db, evaluation_id, current_user.id)
    if not updated:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return updated


# ============================================================================
# Model Deployment Endpoints
# ============================================================================

@router.post("/deployments", response_model=ModelDeployment)
async def create_deployment(
    deployment: ModelDeploymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create model deployment"""
    try:
        return AIProjectService.create_deployment(db, deployment, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/deployments/model/{model_id}", response_model=List[ModelDeployment])
async def get_deployments_by_model(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all deployments for a model"""
    return AIProjectService.get_deployments_by_model(db, model_id)


@router.get("/deployments/{deployment_id}", response_model=ModelDeployment)
async def get_deployment(
    deployment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific deployment"""
    deployment = AIProjectService.get_deployment(db, deployment_id)
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")
    return deployment


@router.put("/deployments/{deployment_id}", response_model=ModelDeployment)
async def update_deployment(
    deployment_id: int,
    deployment_update: ModelDeploymentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update deployment"""
    updated = AIProjectService.update_deployment(db, deployment_id, deployment_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Deployment not found")
    return updated


@router.post("/deployments/{deployment_id}/deploy", response_model=ModelDeployment)
async def deploy_model(
    deployment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Execute model deployment"""
    updated = AIProjectService.deploy_model(db, deployment_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Deployment not found")
    return updated


@router.post("/deployments/{deployment_id}/complete", response_model=ModelDeployment)
async def complete_deployment(
    deployment_id: int,
    success: bool = Query(...),
    logs: Optional[str] = None,
    error: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Complete deployment"""
    updated = AIProjectService.complete_deployment(db, deployment_id, success, logs, error)
    if not updated:
        raise HTTPException(status_code=404, detail="Deployment not found")
    return updated


@router.post("/deployments/{deployment_id}/rollback", response_model=ModelDeployment)
async def rollback_deployment(
    deployment_id: int,
    previous_deployment_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Rollback to previous deployment"""
    updated = AIProjectService.rollback_deployment(db, deployment_id, previous_deployment_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Deployment not found")
    return updated


# ============================================================================
# Model Monitoring Endpoints
# ============================================================================

@router.post("/monitoring", response_model=ModelMonitoring)
async def record_monitoring(
    monitoring: ModelMonitoringCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record monitoring data"""
    try:
        return AIProjectService.record_monitoring(db, monitoring)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/monitoring/deployment/{deployment_id}", response_model=List[ModelMonitoring])
async def get_monitoring_by_deployment(
    deployment_id: int,
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get monitoring history for a deployment"""
    return AIProjectService.get_monitoring_by_deployment(db, deployment_id, limit)


@router.get("/monitoring/deployment/{deployment_id}/latest", response_model=ModelMonitoring)
async def get_latest_monitoring(
    deployment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get latest monitoring data"""
    monitoring = AIProjectService.get_latest_monitoring(db, deployment_id)
    if not monitoring:
        raise HTTPException(status_code=404, detail="No monitoring data found")
    return monitoring


# ============================================================================
# AI Agent Endpoints
# ============================================================================

@router.post("/ai/analyze-feasibility", response_model=dict)
async def analyze_data_feasibility(
    request: AIFeasibilityAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Analyze data feasibility with AI"""
    try:
        agent = AIProjectManagerAgent()
        result = await agent.analyze_data_feasibility(
            business_objectives=request.business_objectives,
            data_sources=request.data_sources,
            compliance_requirements=request.compliance_requirements
        )
        
        # Store AI analysis in business understanding
        if result.get("success") and request.initiative_id:
            business_understanding = AIProjectService.get_business_understanding_by_initiative(db, request.initiative_id)
            if business_understanding:
                business_understanding.ai_feasibility_analysis = result.get("data")
                db.commit()
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/go-no-go/prefill", response_model=dict)
async def prefill_ai_go_no_go(
    request: AIGoNoGoPrefillRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate an AI-prefilled 9-factor Go/No-Go assessment.

    Returns a normalized assessment JSON with deterministic overall rollup.
    Does NOT change the phase governance `go_no_go_decision`.
    """
    try:
        business_understanding = AIProjectService.get_business_understanding_by_initiative(db, request.initiative_id)
        if not business_understanding:
            raise HTTPException(status_code=404, detail="Business understanding not found")

        ctx = request.continuation_context or {}
        business_problem = str(ctx.get("businessProblem") or business_understanding.business_problem_text or "")
        selected_use_case = ctx.get("selectedUseCase") or business_understanding.selected_use_case

        agent = AIProjectManagerAgent()
        result = await agent.prefill_go_no_go_assessment(
            business_problem=business_problem,
            selected_use_case=selected_use_case,
            business_objectives=request.business_objectives or business_understanding.business_objectives or "",
            data_sources=request.data_sources or business_understanding.data_sources_identified or [],
            compliance_requirements=request.compliance_requirements or business_understanding.compliance_requirements or [],
        )

        if not result.get("success"):
            raise HTTPException(status_code=502, detail=result.get("error", "AI Go/No-Go prefill failed"))

        normalized = normalize_assessment(
            {"generated_by": "ai", **(result.get("data") or {})},
            user_id=current_user.id,
        )
        return {"success": True, "data": normalized}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/business-understanding/{business_understanding_id}/ai-go-no-go", response_model=BusinessUnderstanding)
async def save_ai_go_no_go(
    business_understanding_id: int,
    payload: AIGoNoGoSaveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Persist the user-edited AI Go/No-Go assessment.

    Server recomputes overall rollup and stamps editor metadata.
    """
    bu = db.query(BusinessUnderstandingModel).filter(BusinessUnderstandingModel.id == business_understanding_id).first()

    if not bu:
        raise HTTPException(status_code=404, detail="Business understanding not found")

    normalized = normalize_assessment(payload.ai_go_no_go_assessment, user_id=current_user.id)
    bu.ai_go_no_go_assessment = normalized
    db.commit()
    db.refresh(bu)
    return bu


@router.post("/ai/assess-quality", response_model=dict)
async def assess_data_quality(
    request: AIDataQualityRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Assess data quality with AI"""
    try:
        # Get dataset
        dataset = AIProjectService.get_data_understanding(db, request.dataset_id)
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        agent = AIProjectManagerAgent()
        result = await agent.assess_data_quality(
            dataset_name=dataset.dataset_name,
            profiling_results=request.profiling_results
        )
        
        # Store AI assessment
        if result.get("success"):
            dataset.ai_quality_assessment = result.get("data")
            db.commit()
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/suggest-hyperparameters", response_model=dict)
async def suggest_hyperparameters(
    request: AIHyperparameterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Suggest hyperparameters with AI"""
    try:
        # Get model
        model = AIProjectService.get_model(db, request.model_id)
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")
        
        agent = AIProjectManagerAgent()
        result = await agent.suggest_hyperparameters(
            model_type=request.model_type,
            algorithm=request.algorithm,
            dataset_characteristics=request.dataset_characteristics
        )
        
        # Store AI suggestions
        if result.get("success"):
            model.ai_hyperparameter_suggestions = result.get("data")
            db.commit()
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/interpret-results", response_model=dict)
async def interpret_model_results(
    request: AIModelInterpretationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Interpret model results with AI"""
    try:
        # Get evaluation
        evaluation = AIProjectService.get_evaluation(db, request.evaluation_id)
        if not evaluation:
            raise HTTPException(status_code=404, detail="Evaluation not found")
        
        agent = AIProjectManagerAgent()
        result = await agent.interpret_model_results(
            evaluation_metrics=request.evaluation_metrics,
            feature_importance=request.feature_importance
        )
        
        # Store AI interpretation
        if result.get("success"):
            evaluation.ai_interpretation = result.get("data")
            db.commit()
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/detect-drift", response_model=dict)
async def detect_drift(
    request: AIDriftDetectionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Detect drift with AI"""
    try:
        agent = AIProjectManagerAgent()
        result = await agent.detect_drift(
            current_metrics=request.current_metrics,
            historical_metrics=request.historical_metrics
        )
        
        # Store AI drift analysis in latest monitoring record
        if result.get("success"):
            latest_monitoring = AIProjectService.get_latest_monitoring(db, request.deployment_id)
            if latest_monitoring:
                latest_monitoring.ai_drift_analysis = result.get("data")
                db.commit()
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/recommend-next-steps", response_model=dict)
async def recommend_next_steps(
    initiative_id: int,
    current_phase: str,
    phase_status: dict,
    blockers: Optional[List[str]] = None,
    current_user: User = Depends(get_current_user)
):
    """Get AI recommendations for next steps"""
    try:
        agent = AIProjectManagerAgent()
        result = await agent.recommend_next_steps(
            current_phase=current_phase,
            phase_status=phase_status,
            blockers=blockers
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/analyze-deployment-readiness", response_model=dict)
async def analyze_deployment_readiness(
    model_id: int,
    infrastructure_details: dict,
    business_requirements: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Analyze deployment readiness with AI"""
    try:
        # Get model and latest evaluation
        model = AIProjectService.get_model(db, model_id)
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")
        
        evaluations = AIProjectService.get_evaluations_by_model(db, model_id)
        if not evaluations:
            raise HTTPException(status_code=400, detail="No evaluations found for this model")
        
        latest_evaluation = evaluations[0]
        
        agent = AIProjectManagerAgent()
        result = await agent.analyze_deployment_readiness(
            model_metrics=latest_evaluation.evaluation_metrics,
            infrastructure_details=infrastructure_details,
            business_requirements=business_requirements
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Dashboard Endpoints
# ============================================================================

@router.get("/dashboard/overview/{initiative_id}", response_model=ProjectOverviewDashboard)
async def get_project_overview(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get project overview dashboard"""
    overview = AIProjectService.get_project_overview(db, initiative_id)
    if not overview:
        raise HTTPException(status_code=404, detail="Initiative not found")
    return overview
