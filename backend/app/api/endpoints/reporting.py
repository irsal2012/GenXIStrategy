"""
API endpoints for Module 6 - CAIO & Board Reporting
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.reporting import ReportType, ExportFormat
from app.schemas.reporting import (
    # Dashboard schemas
    ValuePipelineData, DeliveredValueData, RiskExposureData,
    StageDistributionData, BottleneckData, PortfolioHealthData,
    # Report schemas
    BoardReport, BoardReportCreate, BoardReportUpdate,
    StrategyBrief, StrategyBriefCreate, StrategyBriefUpdate,
    QuarterlyReport, QuarterlyReportCreate, QuarterlyReportUpdate,
    # AI Agent schemas
    GenerateNarrativeRequest, GenerateNarrativeResponse,
    ExplainTradeoffsRequest, ExplainTradeoffsResponse,
    GenerateTalkingPointsRequest, GenerateTalkingPointsResponse,
    GenerateBoardSummaryRequest, GenerateBoardSummaryResponse,
    GenerateRecommendationsRequest, GenerateRecommendationsResponse,
    # Report generation schemas
    GenerateBoardSlidesRequest, GenerateStrategyBriefRequest,
    GenerateQuarterlyReportRequest
)
from app.services.reporting_service import reporting_service
from app.services.openai_service import openai_service

router = APIRouter()


# ============================================================================
# Dashboard Endpoints
# ============================================================================

@router.get("/dashboards/value-pipeline", response_model=ValuePipelineData)
async def get_value_pipeline_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get value pipeline dashboard data"""
    try:
        return reporting_service.calculate_value_pipeline(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dashboards/delivered-value", response_model=DeliveredValueData)
async def get_delivered_value_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get delivered value dashboard data"""
    try:
        return reporting_service.calculate_delivered_value(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dashboards/risk-exposure", response_model=RiskExposureData)
async def get_risk_exposure_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get risk exposure dashboard data"""
    try:
        return reporting_service.calculate_risk_exposure(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dashboards/stage-distribution", response_model=StageDistributionData)
async def get_stage_distribution_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get stage distribution dashboard data"""
    try:
        return reporting_service.calculate_stage_distribution(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dashboards/bottlenecks", response_model=BottleneckData)
async def get_bottlenecks_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get bottleneck analysis dashboard data"""
    try:
        return reporting_service.identify_bottlenecks(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dashboards/portfolio-health", response_model=PortfolioHealthData)
async def get_portfolio_health_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get portfolio health dashboard data"""
    try:
        return reporting_service.calculate_portfolio_health(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Report Generation Endpoints
# ============================================================================

@router.post("/reports/board-slides", response_model=BoardReport)
async def generate_board_slides(
    request: GenerateBoardSlidesRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate board-ready slides"""
    try:
        report = reporting_service.generate_board_slides(
            db=db,
            user_id=current_user.id,
            period_start=request.period_start,
            period_end=request.period_end,
            include_sections=request.include_sections,
            template_id=request.template_id
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reports/strategy-brief", response_model=StrategyBrief)
async def generate_strategy_brief(
    request: GenerateStrategyBriefRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate one-page AI strategy brief"""
    try:
        brief = reporting_service.generate_strategy_brief(
            db=db,
            user_id=current_user.id,
            period_start=request.period_start,
            period_end=request.period_end,
            template_id=request.template_id
        )
        return brief
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reports/quarterly-report", response_model=QuarterlyReport)
async def generate_quarterly_report(
    request: GenerateQuarterlyReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate quarterly AI impact report"""
    try:
        report = reporting_service.generate_quarterly_report(
            db=db,
            user_id=current_user.id,
            quarter=request.quarter,
            year=request.year,
            include_sections=request.include_sections,
            template_id=request.template_id
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reports", response_model=List[BoardReport])
async def list_reports(
    report_type: Optional[ReportType] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all reports"""
    try:
        from app.models.reporting import BoardReport as BoardReportModel
        
        query = db.query(BoardReportModel)
        
        if report_type:
            query = query.filter(BoardReportModel.report_type == report_type)
        
        reports = query.order_by(BoardReportModel.created_at.desc()).offset(skip).limit(limit).all()
        return reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reports/{report_id}", response_model=BoardReport)
async def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific report"""
    try:
        from app.models.reporting import BoardReport as BoardReportModel
        
        report = db.query(BoardReportModel).filter(BoardReportModel.id == report_id).first()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        return report
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# AI Agent Endpoints
# ============================================================================

@router.post("/ai/generate-narrative", response_model=GenerateNarrativeResponse)
async def generate_executive_narrative(
    request: GenerateNarrativeRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate executive narrative with AI"""
    try:
        result = await openai_service.generate_executive_narrative(
            portfolio_data=request.portfolio_data,
            report_type=request.report_type.value,
            audience=request.audience,
            include_charts=request.include_charts,
            tone=request.tone
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error"))
        
        import json
        data = json.loads(result["data"])
        
        return GenerateNarrativeResponse(
            narrative=data.get("narrative", ""),
            key_points=data.get("key_points", []),
            chart_recommendations=data.get("chart_recommendations", []),
            confidence_score=data.get("confidence_score", 0.0),
            word_count=data.get("word_count", 0)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/explain-tradeoffs", response_model=ExplainTradeoffsResponse)
async def explain_portfolio_tradeoffs(
    request: ExplainTradeoffsRequest,
    current_user: User = Depends(get_current_user)
):
    """Explain portfolio trade-offs with AI"""
    try:
        result = await openai_service.explain_trade_offs(
            decision_context=request.decision_context,
            alternatives=request.alternatives,
            constraints=request.constraints
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error"))
        
        import json
        data = json.loads(result["data"])
        
        return ExplainTradeoffsResponse(
            explanation=data.get("explanation", ""),
            key_tradeoffs=data.get("key_tradeoffs", []),
            recommendation=data.get("recommendation", ""),
            confidence_score=data.get("confidence_score", 0.0)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/talking-points", response_model=GenerateTalkingPointsResponse)
async def generate_talking_points(
    request: GenerateTalkingPointsRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate talking points with AI"""
    try:
        result = await openai_service.prepare_talking_points(
            report_data=request.report_data,
            audience=request.audience,
            max_points=request.max_points
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error"))
        
        import json
        data = json.loads(result["data"])
        
        return GenerateTalkingPointsResponse(
            talking_points=data.get("talking_points", []),
            supporting_data=data.get("supporting_data", {}),
            anticipated_questions=data.get("anticipated_questions", [])
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/board-summary", response_model=GenerateBoardSummaryResponse)
async def generate_board_summary(
    request: GenerateBoardSummaryRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate board summary with AI"""
    try:
        result = await openai_service.generate_board_summary(
            portfolio_data=request.portfolio_data,
            period_start=request.period_start.isoformat(),
            period_end=request.period_end.isoformat(),
            max_paragraphs=request.max_paragraphs
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error"))
        
        import json
        data = json.loads(result["data"])
        
        return GenerateBoardSummaryResponse(
            summary=data.get("summary", ""),
            highlights=data.get("highlights", []),
            concerns=data.get("concerns", []),
            recommendations=data.get("recommendations", []),
            confidence_score=data.get("confidence_score", 0.0)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/recommendations", response_model=GenerateRecommendationsResponse)
async def generate_strategic_recommendations(
    request: GenerateRecommendationsRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate strategic recommendations with AI"""
    try:
        result = await openai_service.generate_strategic_recommendations(
            portfolio_analysis=request.portfolio_analysis,
            trends=request.trends,
            gaps=request.gaps
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error"))
        
        import json
        data = json.loads(result["data"])
        
        return GenerateRecommendationsResponse(
            recommendations=data.get("recommendations", []),
            rationale=data.get("rationale", {}),
            priority_order=data.get("priority_order", []),
            estimated_impact=data.get("estimated_impact", {})
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Metrics Endpoints
# ============================================================================

@router.get("/metrics/portfolio")
async def get_portfolio_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get portfolio-level metrics"""
    try:
        portfolio_health = reporting_service.calculate_portfolio_health(db)
        value_pipeline = reporting_service.calculate_value_pipeline(db)
        delivered_value = reporting_service.calculate_delivered_value(db)
        risk_exposure = reporting_service.calculate_risk_exposure(db)
        
        return {
            "portfolio_health": portfolio_health.dict(),
            "value_pipeline": value_pipeline.dict(),
            "delivered_value": delivered_value.dict(),
            "risk_exposure": risk_exposure.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics/trends")
async def get_metrics_trends(
    period_days: int = Query(90, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get metrics trends over time"""
    try:
        # Mock implementation - would need historical data
        return {
            "period_days": period_days,
            "trends": {
                "portfolio_health": [
                    {"date": "2024-01-01", "value": 75},
                    {"date": "2024-02-01", "value": 78},
                    {"date": "2024-03-01", "value": 82}
                ],
                "total_value": [
                    {"date": "2024-01-01", "value": 1000000},
                    {"date": "2024-02-01", "value": 1500000},
                    {"date": "2024-03-01", "value": 2000000}
                ]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics/benchmarks")
async def get_metrics_benchmarks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get benchmark comparisons"""
    try:
        portfolio_health = reporting_service.calculate_portfolio_health(db)
        
        # Mock benchmarks - would come from industry data
        return {
            "portfolio_health_score": {
                "current": portfolio_health.health_score,
                "industry_average": 75.0,
                "top_quartile": 85.0,
                "comparison": "above_average" if portfolio_health.health_score > 75 else "below_average"
            },
            "average_roi": {
                "current": portfolio_health.average_roi,
                "industry_average": 25.0,
                "top_quartile": 40.0,
                "comparison": "above_average" if portfolio_health.average_roi > 25 else "below_average"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
