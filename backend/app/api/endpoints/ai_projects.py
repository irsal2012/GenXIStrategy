"""
API endpoints for Module 7 - AI Project Management
Complete AI project lifecycle from business understanding through deployment and monitoring
"""
from fastapi import APIRouter, Depends, HTTPException, Query
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

router = APIRouter()


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
    decision: str = Query(..., regex="^(go|no_go)$"),
    rationale: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record Go/No-Go decision"""
    updated = AIProjectService.record_go_no_go_decision(db, business_understanding_id, decision, rationale, current_user.id)
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
