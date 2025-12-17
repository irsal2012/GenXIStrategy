from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.initiative import Initiative, InitiativeStatus
from app.models.risk import Risk, RiskSeverity
from app.services.openai_service import openai_service

router = APIRouter()


@router.get("/dashboard")
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get executive dashboard data."""
    # Total initiatives
    total_initiatives = db.query(Initiative).count()
    
    # Active initiatives
    active_initiatives = db.query(Initiative).filter(
        Initiative.status.in_([
            InitiativeStatus.PLANNING,
            InitiativeStatus.PILOT,
            InitiativeStatus.PRODUCTION
        ])
    ).count()
    
    # Budget metrics
    budget_data = db.query(
        func.sum(Initiative.budget_allocated).label('total_allocated'),
        func.sum(Initiative.budget_spent).label('total_spent')
    ).first()
    
    # ROI metrics
    roi_data = db.query(
        func.avg(Initiative.expected_roi).label('avg_expected_roi'),
        func.avg(Initiative.actual_roi).label('avg_actual_roi')
    ).first()
    
    # Risk metrics
    high_risk_count = db.query(Risk).filter(
        Risk.severity.in_([RiskSeverity.CRITICAL, RiskSeverity.HIGH])
    ).count()
    
    # Status distribution
    status_distribution = db.query(
        Initiative.status,
        func.count(Initiative.id).label('count')
    ).group_by(Initiative.status).all()
    
    # Priority distribution
    priority_distribution = db.query(
        Initiative.priority,
        func.count(Initiative.id).label('count')
    ).group_by(Initiative.priority).all()
    
    return {
        "total_initiatives": total_initiatives,
        "active_initiatives": active_initiatives,
        "total_budget_allocated": float(budget_data.total_allocated or 0),
        "total_budget_spent": float(budget_data.total_spent or 0),
        "avg_expected_roi": float(roi_data.avg_expected_roi or 0),
        "avg_actual_roi": float(roi_data.avg_actual_roi or 0),
        "high_risk_count": high_risk_count,
        "status_distribution": [
            {"status": item.status.value, "count": item.count}
            for item in status_distribution
        ],
        "priority_distribution": [
            {"priority": item.priority.value, "count": item.count}
            for item in priority_distribution
        ]
    }


@router.get("/portfolio-summary")
async def get_portfolio_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate AI-powered executive summary of the portfolio."""
    # Gather portfolio data
    total_initiatives = db.query(Initiative).count()
    active_initiatives = db.query(Initiative).filter(
        Initiative.status.in_([
            InitiativeStatus.PLANNING,
            InitiativeStatus.PILOT,
            InitiativeStatus.PRODUCTION
        ])
    ).count()
    
    budget_data = db.query(
        func.sum(Initiative.budget_allocated).label('total_allocated')
    ).first()
    
    roi_data = db.query(
        func.avg(Initiative.expected_roi).label('avg_expected_roi')
    ).first()
    
    high_risk_count = db.query(Risk).filter(
        Risk.severity.in_([RiskSeverity.CRITICAL, RiskSeverity.HIGH])
    ).count()
    
    # Get top initiatives
    top_initiatives = db.query(Initiative).order_by(
        Initiative.business_value_score.desc()
    ).limit(5).all()
    
    portfolio_data = {
        "total_initiatives": total_initiatives,
        "active_initiatives": active_initiatives,
        "total_budget": float(budget_data.total_allocated or 0),
        "expected_roi": float(roi_data.avg_expected_roi or 0),
        "high_risk_count": high_risk_count,
        "compliance_status": "In Progress",
        "key_initiatives": [
            f"{init.title} (Score: {init.business_value_score})"
            for init in top_initiatives
        ]
    }
    
    # Generate summary using OpenAI
    summary = await openai_service.generate_executive_summary(portfolio_data)
    
    return {
        "summary": summary,
        "data": portfolio_data
    }


@router.get("/metrics")
def get_portfolio_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get detailed portfolio metrics."""
    # Average scores
    avg_scores = db.query(
        func.avg(Initiative.business_value_score).label('avg_business_value'),
        func.avg(Initiative.technical_feasibility_score).label('avg_technical_feasibility'),
        func.avg(Initiative.risk_score).label('avg_risk'),
        func.avg(Initiative.strategic_alignment_score).label('avg_strategic_alignment')
    ).first()
    
    return {
        "average_scores": {
            "business_value": float(avg_scores.avg_business_value or 0),
            "technical_feasibility": float(avg_scores.avg_technical_feasibility or 0),
            "risk": float(avg_scores.avg_risk or 0),
            "strategic_alignment": float(avg_scores.avg_strategic_alignment or 0)
        }
    }
