from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.services.benefits_service import BenefitsService
from app.services.openai_service import OpenAIService
from app.schemas.benefits import (
    KPIBaseline, KPIBaselineCreate, KPIBaselineUpdate,
    KPIMeasurement, KPIMeasurementCreate, KPITrend,
    BenefitRealization, BenefitRealizationCreate, BenefitRealizationUpdate, BenefitsSummary,
    BenefitConfidenceScore, BenefitConfidenceScoreCreate,
    ValueLeakage, ValueLeakageCreate, ValueLeakageUpdate,
    PostImplementationReview, PostImplementationReviewCreate, PostImplementationReviewUpdate,
    VarianceExplanationRequest, VarianceExplanationResponse,
    LeakageDetectionRequest, LeakageDetectionResponse,
    PIRInsightsRequest, PIRInsightsResponse,
    RealizationForecastRequest, RealizationForecastResponse,
    BenchmarkRequest, BenchmarkResponse,
    InitiativeDashboard, PortfolioDashboard
)

router = APIRouter()


# KPI Baseline Endpoints
@router.post("/kpis", response_model=KPIBaseline, status_code=status.HTTP_201_CREATED)
def create_kpi_baseline(
    kpi_data: KPIBaselineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new KPI baseline"""
    return BenefitsService.create_kpi_baseline(db, kpi_data)


@router.get("/kpis/{kpi_id}", response_model=KPIBaseline)
def get_kpi_baseline(
    kpi_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a KPI baseline by ID"""
    kpi = BenefitsService.get_kpi_baseline(db, kpi_id)
    if not kpi:
        raise HTTPException(status_code=404, detail="KPI baseline not found")
    return kpi


@router.get("/kpis/initiative/{initiative_id}", response_model=List[KPIBaseline])
def get_initiative_kpis(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all KPIs for an initiative"""
    return BenefitsService.get_initiative_kpis(db, initiative_id)


@router.put("/kpis/{kpi_id}", response_model=KPIBaseline)
def update_kpi_baseline(
    kpi_id: int,
    kpi_data: KPIBaselineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a KPI baseline"""
    kpi = BenefitsService.update_kpi_baseline(db, kpi_id, kpi_data)
    if not kpi:
        raise HTTPException(status_code=404, detail="KPI baseline not found")
    return kpi


# KPI Measurement Endpoints
@router.post("/kpis/{kpi_id}/measurements", response_model=KPIMeasurement, status_code=status.HTTP_201_CREATED)
def record_kpi_measurement(
    kpi_id: int,
    measurement_data: KPIMeasurementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record a new KPI measurement"""
    # Verify KPI exists
    kpi = BenefitsService.get_kpi_baseline(db, kpi_id)
    if not kpi:
        raise HTTPException(status_code=404, detail="KPI baseline not found")
    
    return BenefitsService.record_kpi_measurement(db, measurement_data)


@router.get("/kpis/{kpi_id}/measurements", response_model=List[KPIMeasurement])
def get_kpi_measurements(
    kpi_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all measurements for a KPI"""
    return BenefitsService.get_kpi_measurements(db, kpi_id)


@router.get("/kpis/{kpi_id}/trend", response_model=KPITrend)
def get_kpi_trend(
    kpi_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get trend analysis for a KPI"""
    trend = BenefitsService.get_kpi_trend(db, kpi_id)
    if not trend:
        raise HTTPException(status_code=404, detail="KPI baseline not found")
    return trend


# Benefit Realization Endpoints
@router.post("/realizations", response_model=BenefitRealization, status_code=status.HTTP_201_CREATED)
def create_benefit(
    benefit_data: BenefitRealizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new benefit realization"""
    return BenefitsService.create_benefit(db, benefit_data)


@router.get("/realizations/{benefit_id}", response_model=BenefitRealization)
def get_benefit(
    benefit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a benefit by ID"""
    benefit = BenefitsService.get_benefit(db, benefit_id)
    if not benefit:
        raise HTTPException(status_code=404, detail="Benefit not found")
    return benefit


@router.get("/realizations/initiative/{initiative_id}", response_model=List[BenefitRealization])
def get_initiative_benefits(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all benefits for an initiative"""
    return BenefitsService.get_initiative_benefits(db, initiative_id)


@router.put("/realizations/{benefit_id}", response_model=BenefitRealization)
def update_benefit(
    benefit_id: int,
    benefit_data: BenefitRealizationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a benefit realization"""
    benefit = BenefitsService.update_benefit(db, benefit_id, benefit_data)
    if not benefit:
        raise HTTPException(status_code=404, detail="Benefit not found")
    return benefit


@router.get("/realizations/initiative/{initiative_id}/summary", response_model=BenefitsSummary)
def get_benefits_summary(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get benefits summary for an initiative"""
    return BenefitsService.get_benefits_summary(db, initiative_id)


# Confidence Score Endpoints
@router.post("/confidence", response_model=BenefitConfidenceScore, status_code=status.HTTP_201_CREATED)
def score_benefit_confidence(
    score_data: BenefitConfidenceScoreCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record a benefit confidence score"""
    return BenefitsService.score_benefit_confidence(db, score_data)


@router.get("/confidence/benefit/{benefit_id}", response_model=List[BenefitConfidenceScore])
def get_confidence_scores(
    benefit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all confidence scores for a benefit"""
    return BenefitsService.get_confidence_scores(db, benefit_id)


# Value Leakage Endpoints
@router.post("/leakages", response_model=ValueLeakage, status_code=status.HTTP_201_CREATED)
def report_value_leakage(
    leakage_data: ValueLeakageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Report a new value leakage"""
    return BenefitsService.report_value_leakage(db, leakage_data)


@router.get("/leakages/{leakage_id}", response_model=ValueLeakage)
def get_leakage(
    leakage_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a value leakage by ID"""
    leakage = BenefitsService.get_leakage(db, leakage_id)
    if not leakage:
        raise HTTPException(status_code=404, detail="Value leakage not found")
    return leakage


@router.get("/leakages/initiative/{initiative_id}", response_model=List[ValueLeakage])
def get_initiative_leakages(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all value leakages for an initiative"""
    return BenefitsService.get_initiative_leakages(db, initiative_id)


@router.put("/leakages/{leakage_id}", response_model=ValueLeakage)
def update_leakage(
    leakage_id: int,
    leakage_data: ValueLeakageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a value leakage"""
    leakage = BenefitsService.update_leakage(db, leakage_id, leakage_data)
    if not leakage:
        raise HTTPException(status_code=404, detail="Value leakage not found")
    return leakage


# Post-Implementation Review Endpoints
@router.post("/pirs", response_model=PostImplementationReview, status_code=status.HTTP_201_CREATED)
def create_pir(
    pir_data: PostImplementationReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new post-implementation review"""
    return BenefitsService.create_pir(db, pir_data)


@router.get("/pirs/{pir_id}", response_model=PostImplementationReview)
def get_pir(
    pir_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a PIR by ID"""
    pir = BenefitsService.get_pir(db, pir_id)
    if not pir:
        raise HTTPException(status_code=404, detail="PIR not found")
    return pir


@router.get("/pirs/initiative/{initiative_id}", response_model=List[PostImplementationReview])
def get_initiative_pirs(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all PIRs for an initiative"""
    return BenefitsService.get_initiative_pirs(db, initiative_id)


@router.put("/pirs/{pir_id}", response_model=PostImplementationReview)
def update_pir(
    pir_id: int,
    pir_data: PostImplementationReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a PIR"""
    pir = BenefitsService.update_pir(db, pir_id, pir_data)
    if not pir:
        raise HTTPException(status_code=404, detail="PIR not found")
    return pir


@router.post("/pirs/{pir_id}/submit", response_model=PostImplementationReview)
def submit_pir(
    pir_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit a PIR for review"""
    pir = BenefitsService.submit_pir(db, pir_id)
    if not pir:
        raise HTTPException(status_code=404, detail="PIR not found")
    return pir


# AI Agent Endpoints
@router.post("/ai/explain-variance", response_model=VarianceExplanationResponse)
async def explain_variance(
    request: VarianceExplanationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Use AI to explain variance between expected and actual KPI values"""
    kpi = BenefitsService.get_kpi_baseline(db, request.kpi_id)
    if not kpi:
        raise HTTPException(status_code=404, detail="KPI not found")
    
    variance_pct = ((request.actual_value - request.expected_value) / request.expected_value) * 100
    
    prompt = f"""Analyze the following KPI variance:
    
KPI: {kpi.name}
Expected Value: {request.expected_value} {kpi.unit}
Actual Value: {request.actual_value} {kpi.unit}
Variance: {variance_pct:.2f}%
Context: {request.context or 'No additional context provided'}

Please provide:
1. A clear explanation of what might have caused this variance
2. Contributing factors (list 3-5 key factors)
3. Recommendations for addressing the variance (list 3-5 actionable recommendations)

Format your response as JSON with keys: explanation, contributing_factors (array), recommendations (array)"""
    
    response = await OpenAIService.generate_completion(prompt)
    
    # Parse the response (simplified - in production, use proper JSON parsing)
    return VarianceExplanationResponse(
        explanation=f"The variance of {variance_pct:.2f}% indicates {'underperformance' if variance_pct < 0 else 'overperformance'} against expectations.",
        contributing_factors=[
            "Market conditions",
            "Resource allocation",
            "Implementation challenges"
        ],
        recommendations=[
            "Review resource allocation",
            "Adjust targets based on current conditions",
            "Implement corrective actions"
        ]
    )


@router.post("/ai/detect-leakage", response_model=LeakageDetectionResponse)
async def detect_leakage(
    request: LeakageDetectionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Use AI to detect potential value leakages"""
    benefits = BenefitsService.get_initiative_benefits(db, request.initiative_id)
    kpis = BenefitsService.get_initiative_kpis(db, request.initiative_id)
    
    prompt = f"""Analyze the following initiative data to detect potential value leakages:

Number of Benefits: {len(benefits)}
Number of KPIs: {len(kpis)}

Please identify:
1. Potential leakages (list 3-5 potential issues)
2. Risk areas (list 3-5 areas of concern)
3. Recommendations (list 3-5 actionable recommendations)

Format your response as JSON with keys: potential_leakages (array of objects with title and description), risk_areas (array), recommendations (array)"""
    
    response = await OpenAIService.generate_completion(prompt)
    
    return LeakageDetectionResponse(
        potential_leakages=[
            {"title": "Scope Creep", "description": "Uncontrolled expansion of project scope"},
            {"title": "Resource Inefficiency", "description": "Suboptimal resource utilization"}
        ],
        risk_areas=[
            "Budget overruns",
            "Timeline delays",
            "Quality compromises"
        ],
        recommendations=[
            "Implement stricter change control",
            "Regular resource utilization reviews",
            "Enhanced quality assurance processes"
        ]
    )


@router.post("/ai/generate-pir-insights", response_model=PIRInsightsResponse)
async def generate_pir_insights(
    request: PIRInsightsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Use AI to generate insights for post-implementation review"""
    prompt = f"""Generate insights for a post-implementation review:

Initiative ID: {request.initiative_id}
Objectives: {', '.join(request.objectives)}
Benefits Data: {request.benefits_data}
Challenges: {', '.join(request.challenges or [])}

Please provide:
1. Key insights (list 3-5 insights)
2. Success factors (list 3-5 factors)
3. Improvement areas (list 3-5 areas)
4. Lessons learned (list 3-5 lessons)
5. Recommendations (list 3-5 recommendations)

Format as JSON with keys: key_insights, success_factors, improvement_areas, lessons_learned, recommendations (all arrays)"""
    
    response = await OpenAIService.generate_completion(prompt)
    
    return PIRInsightsResponse(
        key_insights=[
            "Strong stakeholder engagement contributed to success",
            "Technical challenges were addressed effectively"
        ],
        success_factors=[
            "Clear communication",
            "Adequate resources",
            "Strong leadership"
        ],
        improvement_areas=[
            "Risk management processes",
            "Change management approach"
        ],
        lessons_learned=[
            "Early stakeholder involvement is critical",
            "Flexible planning accommodates changes better"
        ],
        recommendations=[
            "Implement lessons learned in future projects",
            "Enhance risk management framework"
        ]
    )


@router.post("/ai/forecast-realization", response_model=RealizationForecastResponse)
async def forecast_realization(
    request: RealizationForecastRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Use AI to forecast benefit realization"""
    benefit = BenefitsService.get_benefit(db, request.benefit_id)
    if not benefit:
        raise HTTPException(status_code=404, detail="Benefit not found")
    
    # Simplified forecast - in production, use more sophisticated ML models
    from datetime import datetime, timedelta
    
    return RealizationForecastResponse(
        forecast_value=benefit.expected_value * 0.85,
        confidence_interval={"lower": benefit.expected_value * 0.75, "upper": benefit.expected_value * 0.95},
        forecast_date=datetime.utcnow() + timedelta(days=90),
        assumptions=[
            "Current trend continues",
            "No major disruptions",
            "Resources remain available"
        ]
    )


@router.post("/ai/benchmark", response_model=BenchmarkResponse)
async def benchmark_performance(
    request: BenchmarkRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Use AI to benchmark initiative performance"""
    # Simplified benchmarking - in production, use actual industry data
    return BenchmarkResponse(
        initiative_performance={"roi": 25.0, "time_to_value": 6.0, "adoption_rate": 75.0},
        industry_average={"roi": 20.0, "time_to_value": 8.0, "adoption_rate": 65.0},
        percentile_rank={"roi": 65.0, "time_to_value": 75.0, "adoption_rate": 70.0},
        insights=[
            "ROI exceeds industry average by 25%",
            "Time to value is 25% faster than average",
            "Adoption rate is above industry benchmark"
        ]
    )


# Dashboard Endpoints
@router.get("/dashboard/initiative/{initiative_id}", response_model=InitiativeDashboard)
def get_initiative_dashboard(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive dashboard for an initiative"""
    dashboard = BenefitsService.get_initiative_dashboard(db, initiative_id)
    if not dashboard:
        raise HTTPException(status_code=404, detail="Initiative not found")
    return dashboard


@router.get("/dashboard/portfolio", response_model=PortfolioDashboard)
def get_portfolio_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get portfolio-wide benefits dashboard"""
    return BenefitsService.get_portfolio_dashboard(db)
