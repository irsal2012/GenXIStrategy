from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.initiative import Initiative, InitiativeStatus, AIType
from app.models.scoring import InitiativeScore, InitiativeComparison, ScenarioSimulation
from app.schemas.scoring import (
    PortfolioBalanceResponse,
    ComparisonRequest,
    InitiativeComparison as InitiativeComparisonSchema,
    SimulatePortfolioRequest,
    ScenarioSimulation as ScenarioSimulationSchema,
    ScenarioSimulationCreate,
    ScenarioSimulationUpdate
)
from app.services.scoring_service import ScoringService
from app.services.openai_service import openai_service
import json
from datetime import datetime

router = APIRouter()


@router.get("/balance", response_model=PortfolioBalanceResponse)
def get_portfolio_balance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get portfolio balance and composition analysis."""
    # Get all initiatives
    initiatives = db.query(Initiative).all()
    total_initiatives = len(initiatives)
    
    # Count by AI type
    by_ai_type = {}
    for ai_type in AIType:
        count = db.query(Initiative).filter(Initiative.ai_type == ai_type).count()
        by_ai_type[ai_type.value] = count
    
    # Count by risk tier (using risk_score as proxy)
    by_risk_tier = {
        "low": db.query(Initiative).filter(Initiative.risk_score <= 3).count(),
        "medium": db.query(Initiative).filter(Initiative.risk_score > 3, Initiative.risk_score <= 7).count(),
        "high": db.query(Initiative).filter(Initiative.risk_score > 7).count()
    }
    
    # Count by strategic domain
    domains = db.query(Initiative.strategic_domain, func.count(Initiative.id)).group_by(
        Initiative.strategic_domain
    ).all()
    by_strategic_domain = {domain: count for domain, count in domains if domain}
    
    # Count by status
    by_status = {}
    for status_val in InitiativeStatus:
        count = db.query(Initiative).filter(Initiative.status == status_val).count()
        by_status[status_val.value] = count
    
    # Calculate financial metrics
    total_budget = db.query(func.sum(Initiative.budget_allocated)).scalar() or 0.0
    
    # Calculate average expected ROI
    avg_roi = db.query(func.avg(Initiative.expected_roi)).filter(
        Initiative.expected_roi.isnot(None)
    ).scalar() or 0.0
    
    return PortfolioBalanceResponse(
        total_initiatives=total_initiatives,
        by_ai_type=by_ai_type,
        by_risk_tier=by_risk_tier,
        by_strategic_domain=by_strategic_domain,
        by_status=by_status,
        total_budget=float(total_budget),
        total_expected_roi=float(avg_roi),
        recommendations=[]
    )


@router.post("/balance/analyze")
async def analyze_portfolio_balance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI-powered portfolio balance analysis and recommendations."""
    # Get portfolio data
    balance = get_portfolio_balance(db, current_user)
    
    # Get AI analysis
    portfolio_data = {
        "total_initiatives": balance.total_initiatives,
        "by_ai_type": balance.by_ai_type,
        "by_risk_tier": balance.by_risk_tier,
        "by_strategic_domain": balance.by_strategic_domain,
        "by_status": balance.by_status,
        "total_budget": balance.total_budget,
        "total_expected_roi": balance.total_expected_roi
    }
    
    ai_result = await openai_service.analyze_portfolio_balance(portfolio_data)
    
    if not ai_result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI analysis failed: {ai_result.get('error')}"
        )
    
    analysis = json.loads(ai_result["data"])
    
    return {
        "portfolio_balance": balance,
        "ai_analysis": analysis
    }


@router.post("/compare", response_model=InitiativeComparisonSchema)
async def compare_initiatives(
    request: ComparisonRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Compare two initiatives and explain ranking differences."""
    # Get initiatives
    initiative_a = db.query(Initiative).filter(Initiative.id == request.initiative_a_id).first()
    initiative_b = db.query(Initiative).filter(Initiative.id == request.initiative_b_id).first()
    
    if not initiative_a or not initiative_b:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or both initiatives not found"
        )
    
    # Get scores
    scoring_service = ScoringService(db)
    model = scoring_service.get_active_scoring_model()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active scoring model found"
        )
    
    score_a = db.query(InitiativeScore).filter(
        InitiativeScore.initiative_id == request.initiative_a_id,
        InitiativeScore.model_version_id == model.id
    ).first()
    
    score_b = db.query(InitiativeScore).filter(
        InitiativeScore.initiative_id == request.initiative_b_id,
        InitiativeScore.model_version_id == model.id
    ).first()
    
    if not score_a or not score_b:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scores not found for one or both initiatives"
        )
    
    # Prepare data for AI comparison
    initiative_a_data = {
        "id": initiative_a.id,
        "title": initiative_a.title,
        "description": initiative_a.description,
        "business_objective": initiative_a.business_objective
    }
    
    initiative_b_data = {
        "id": initiative_b.id,
        "title": initiative_b.title,
        "description": initiative_b.description,
        "business_objective": initiative_b.business_objective
    }
    
    score_a_data = {
        "overall_score": score_a.overall_score,
        "value_score": score_a.value_score,
        "feasibility_score": score_a.feasibility_score,
        "risk_score": score_a.risk_score,
        "strategic_alignment_score": score_a.strategic_alignment_score
    }
    
    score_b_data = {
        "overall_score": score_b.overall_score,
        "value_score": score_b.value_score,
        "feasibility_score": score_b.feasibility_score,
        "risk_score": score_b.risk_score,
        "strategic_alignment_score": score_b.strategic_alignment_score
    }
    
    # Get AI comparison
    ai_result = await openai_service.compare_initiatives(
        initiative_a_data, initiative_b_data, score_a_data, score_b_data
    )
    
    if not ai_result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI comparison failed: {ai_result.get('error')}"
        )
    
    comparison_data = json.loads(ai_result["data"])
    
    # Determine winner
    winner_id = request.initiative_a_id if comparison_data.get("winner") == "A" else request.initiative_b_id
    score_difference = abs(score_a.overall_score - score_b.overall_score)
    
    # Create or update comparison record
    existing_comparison = db.query(InitiativeComparison).filter(
        InitiativeComparison.initiative_a_id == request.initiative_a_id,
        InitiativeComparison.initiative_b_id == request.initiative_b_id
    ).first()
    
    if existing_comparison:
        existing_comparison.winner_id = winner_id
        existing_comparison.score_difference = score_difference
        existing_comparison.dimension_comparison = comparison_data.get("dimension_comparison")
        existing_comparison.key_differentiators = comparison_data.get("key_differentiators", [])
        existing_comparison.justification = comparison_data.get("justification")
        existing_comparison.recommendation = comparison_data.get("recommendation")
        existing_comparison.compared_at = datetime.utcnow()
        existing_comparison.compared_by_id = current_user.id
        comparison = existing_comparison
    else:
        comparison = InitiativeComparison(
            initiative_a_id=request.initiative_a_id,
            initiative_b_id=request.initiative_b_id,
            winner_id=winner_id,
            score_difference=score_difference,
            dimension_comparison=comparison_data.get("dimension_comparison"),
            key_differentiators=comparison_data.get("key_differentiators", []),
            justification=comparison_data.get("justification"),
            recommendation=comparison_data.get("recommendation"),
            compared_by_id=current_user.id
        )
        db.add(comparison)
    
    db.commit()
    db.refresh(comparison)
    
    return comparison


@router.post("/simulate", response_model=ScenarioSimulationSchema)
async def simulate_portfolio_scenario(
    request: SimulatePortfolioRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Run portfolio optimization scenario simulation."""
    # Get initiatives to consider
    if request.initiative_ids:
        initiatives = db.query(Initiative).filter(Initiative.id.in_(request.initiative_ids)).all()
    else:
        # Consider all active initiatives
        initiatives = db.query(Initiative).filter(
            Initiative.status.in_([InitiativeStatus.IDEATION, InitiativeStatus.PLANNING, InitiativeStatus.PILOT])
        ).all()
    
    # Get scores for initiatives
    scoring_service = ScoringService(db)
    model = scoring_service.get_active_scoring_model()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active scoring model found"
        )
    
    # Prepare initiative data with scores
    initiatives_data = []
    for initiative in initiatives:
        score = db.query(InitiativeScore).filter(
            InitiativeScore.initiative_id == initiative.id,
            InitiativeScore.model_version_id == model.id
        ).first()
        
        if score:
            initiatives_data.append({
                "id": initiative.id,
                "title": initiative.title,
                "overall_score": score.overall_score,
                "value_score": score.value_score,
                "feasibility_score": score.feasibility_score,
                "risk_score": score.risk_score,
                "budget": initiative.budget_allocated or 0,
                "expected_roi": initiative.expected_roi or 0,
                "ai_type": initiative.ai_type.value if initiative.ai_type else None,
                "status": initiative.status.value
            })
    
    # Prepare constraints
    constraints = {
        "budget_constraint": request.scenario.budget_constraint,
        "capacity_constraint": request.scenario.capacity_constraint,
        "timeline_constraint": request.scenario.timeline_constraint,
        "risk_tolerance": request.scenario.risk_tolerance,
        "target_portfolio_mix": request.scenario.target_portfolio_mix
    }
    
    # Get AI optimization
    ai_result = await openai_service.optimize_portfolio_scenario(initiatives_data, constraints)
    
    if not ai_result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI optimization failed: {ai_result.get('error')}"
        )
    
    optimization_data = json.loads(ai_result["data"])
    
    # Create scenario simulation record
    simulation = ScenarioSimulation(
        name=request.scenario.name,
        description=request.scenario.description,
        budget_constraint=request.scenario.budget_constraint,
        capacity_constraint=request.scenario.capacity_constraint,
        timeline_constraint=request.scenario.timeline_constraint,
        target_portfolio_mix=request.scenario.target_portfolio_mix,
        risk_tolerance=request.scenario.risk_tolerance,
        selected_initiatives=optimization_data.get("selected_initiative_ids", []),
        total_budget_allocated=optimization_data.get("total_budget"),
        total_expected_roi=optimization_data.get("total_expected_roi"),
        portfolio_mix=optimization_data.get("portfolio_mix"),
        risk_distribution=optimization_data.get("risk_distribution"),
        optimization_strategy=optimization_data.get("optimization_strategy"),
        trade_offs=optimization_data.get("trade_offs", []),
        alternative_scenarios=optimization_data.get("alternative_scenarios", []),
        created_by_id=current_user.id
    )
    
    db.add(simulation)
    db.commit()
    db.refresh(simulation)
    
    return simulation


@router.get("/simulations", response_model=List[ScenarioSimulationSchema])
def get_scenario_simulations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all saved scenario simulations."""
    simulations = db.query(ScenarioSimulation).order_by(
        ScenarioSimulation.created_at.desc()
    ).offset(skip).limit(limit).all()
    return simulations


@router.get("/simulations/{simulation_id}", response_model=ScenarioSimulationSchema)
def get_scenario_simulation(
    simulation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific scenario simulation."""
    simulation = db.query(ScenarioSimulation).filter(
        ScenarioSimulation.id == simulation_id
    ).first()
    
    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario simulation not found"
        )
    
    return simulation


@router.put("/simulations/{simulation_id}", response_model=ScenarioSimulationSchema)
def update_scenario_simulation(
    simulation_id: int,
    simulation_in: ScenarioSimulationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a scenario simulation."""
    simulation = db.query(ScenarioSimulation).filter(
        ScenarioSimulation.id == simulation_id
    ).first()
    
    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario simulation not found"
        )
    
    update_data = simulation_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(simulation, field, value)
    
    simulation.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(simulation)
    return simulation


@router.delete("/simulations/{simulation_id}")
def delete_scenario_simulation(
    simulation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a scenario simulation."""
    simulation = db.query(ScenarioSimulation).filter(
        ScenarioSimulation.id == simulation_id
    ).first()
    
    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario simulation not found"
        )
    
    db.delete(simulation)
    db.commit()
    return {"message": "Scenario simulation deleted successfully"}
