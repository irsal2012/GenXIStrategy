"""
Pydantic schemas for Module 6 - CAIO & Board Reporting
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.reporting import DashboardType, ReportType, ReportStatus, MetricType, ExportFormat


# ============================================================================
# Executive Dashboard Schemas
# ============================================================================

class ExecutiveDashboardBase(BaseModel):
    name: str = Field(..., max_length=200)
    dashboard_type: DashboardType
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    layout: Optional[Dict[str, Any]] = None
    is_default: bool = False
    is_public: bool = False


class ExecutiveDashboardCreate(ExecutiveDashboardBase):
    pass


class ExecutiveDashboardUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    layout: Optional[Dict[str, Any]] = None
    is_default: Optional[bool] = None
    is_public: Optional[bool] = None


class ExecutiveDashboard(ExecutiveDashboardBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    last_viewed_at: Optional[datetime] = None
    view_count: int

    class Config:
        from_attributes = True


# ============================================================================
# Board Report Schemas
# ============================================================================

class BoardReportBase(BaseModel):
    title: str = Field(..., max_length=300)
    report_type: ReportType
    executive_summary: Optional[str] = None
    key_metrics: Optional[Dict[str, Any]] = None
    narrative: Optional[str] = None
    recommendations: Optional[List[str]] = None
    report_data: Optional[Dict[str, Any]] = None
    charts_config: Optional[Dict[str, Any]] = None
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None


class BoardReportCreate(BoardReportBase):
    pass


class BoardReportUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=300)
    status: Optional[ReportStatus] = None
    executive_summary: Optional[str] = None
    key_metrics: Optional[Dict[str, Any]] = None
    narrative: Optional[str] = None
    recommendations: Optional[List[str]] = None
    report_data: Optional[Dict[str, Any]] = None
    charts_config: Optional[Dict[str, Any]] = None
    delivered_to: Optional[List[str]] = None
    delivered_at: Optional[datetime] = None


class BoardReport(BoardReportBase):
    id: int
    status: ReportStatus
    generated_by: int
    generated_at: Optional[datetime] = None
    generation_time_seconds: Optional[float] = None
    ai_generated: bool
    ai_model_used: Optional[str] = None
    ai_confidence_score: Optional[float] = None
    delivered_to: Optional[List[str]] = None
    delivered_at: Optional[datetime] = None
    export_format: Optional[ExportFormat] = None
    file_path: Optional[str] = None
    file_size_bytes: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Strategy Brief Schemas
# ============================================================================

class StrategyBriefBase(BaseModel):
    title: str = Field(..., max_length=300)
    portfolio_health_score: Optional[float] = Field(None, ge=0, le=100)
    key_metrics: Optional[Dict[str, Any]] = None
    top_achievements: Optional[List[str]] = None
    top_risks: Optional[List[str]] = None
    strategic_recommendations: Optional[List[str]] = None
    next_quarter_priorities: Optional[List[str]] = None
    executive_narrative: Optional[str] = None
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None


class StrategyBriefCreate(StrategyBriefBase):
    pass


class StrategyBriefUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=300)
    portfolio_health_score: Optional[float] = Field(None, ge=0, le=100)
    key_metrics: Optional[Dict[str, Any]] = None
    top_achievements: Optional[List[str]] = None
    top_risks: Optional[List[str]] = None
    strategic_recommendations: Optional[List[str]] = None
    next_quarter_priorities: Optional[List[str]] = None
    executive_narrative: Optional[str] = None


class StrategyBrief(StrategyBriefBase):
    id: int
    generated_by: int
    generated_at: datetime
    ai_generated: bool
    file_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Quarterly Report Schemas
# ============================================================================

class QuarterlyReportBase(BaseModel):
    title: str = Field(..., max_length=300)
    quarter: str = Field(..., max_length=10)
    year: int
    executive_summary: Optional[str] = None
    portfolio_performance: Optional[Dict[str, Any]] = None
    value_realization: Optional[Dict[str, Any]] = None
    risk_management: Optional[Dict[str, Any]] = None
    governance_compliance: Optional[Dict[str, Any]] = None
    initiative_highlights: Optional[List[Dict[str, Any]]] = None
    lessons_learned: Optional[List[str]] = None
    next_quarter_outlook: Optional[Dict[str, Any]] = None
    total_initiatives: Optional[int] = None
    total_value_delivered: Optional[float] = None
    total_budget_spent: Optional[float] = None
    average_roi: Optional[float] = None
    risk_score: Optional[float] = None


class QuarterlyReportCreate(QuarterlyReportBase):
    pass


class QuarterlyReportUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=300)
    executive_summary: Optional[str] = None
    portfolio_performance: Optional[Dict[str, Any]] = None
    value_realization: Optional[Dict[str, Any]] = None
    risk_management: Optional[Dict[str, Any]] = None
    governance_compliance: Optional[Dict[str, Any]] = None
    initiative_highlights: Optional[List[Dict[str, Any]]] = None
    lessons_learned: Optional[List[str]] = None
    next_quarter_outlook: Optional[Dict[str, Any]] = None
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None


class QuarterlyReport(QuarterlyReportBase):
    id: int
    generated_by: int
    generated_at: datetime
    ai_generated: bool
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    file_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Reporting Metric Schemas
# ============================================================================

class ReportingMetricBase(BaseModel):
    metric_name: str = Field(..., max_length=200)
    metric_type: MetricType
    value: Optional[float] = None
    value_text: Optional[str] = Field(None, max_length=500)
    unit: Optional[str] = Field(None, max_length=50)
    initiative_id: Optional[int] = None
    portfolio_level: bool = False
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    calculation_method: Optional[str] = Field(None, max_length=200)
    data_sources: Optional[List[str]] = None
    previous_value: Optional[float] = None
    change_percentage: Optional[float] = None
    trend: Optional[str] = Field(None, max_length=20)


class ReportingMetricCreate(ReportingMetricBase):
    pass


class ReportingMetricUpdate(BaseModel):
    value: Optional[float] = None
    value_text: Optional[str] = Field(None, max_length=500)
    previous_value: Optional[float] = None
    change_percentage: Optional[float] = None
    trend: Optional[str] = Field(None, max_length=20)


class ReportingMetric(ReportingMetricBase):
    id: int
    calculated_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Narrative Template Schemas
# ============================================================================

class NarrativeTemplateBase(BaseModel):
    name: str = Field(..., max_length=200)
    report_type: ReportType
    template_text: Optional[str] = None
    sections: Optional[Dict[str, Any]] = None
    required_metrics: Optional[List[str]] = None
    optional_metrics: Optional[List[str]] = None
    ai_prompt_template: Optional[str] = None
    is_default: bool = False
    is_active: bool = True


class NarrativeTemplateCreate(NarrativeTemplateBase):
    pass


class NarrativeTemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=200)
    template_text: Optional[str] = None
    sections: Optional[Dict[str, Any]] = None
    required_metrics: Optional[List[str]] = None
    optional_metrics: Optional[List[str]] = None
    ai_prompt_template: Optional[str] = None
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None


class NarrativeTemplate(NarrativeTemplateBase):
    id: int
    usage_count: int
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Report Schedule Schemas
# ============================================================================

class ReportScheduleBase(BaseModel):
    name: str = Field(..., max_length=200)
    report_type: ReportType
    frequency: str = Field(..., max_length=50)
    day_of_week: Optional[int] = Field(None, ge=0, le=6)
    day_of_month: Optional[int] = Field(None, ge=1, le=31)
    month: Optional[int] = Field(None, ge=1, le=12)
    time_of_day: Optional[str] = Field(None, max_length=10)
    recipients: Optional[List[str]] = None
    template_id: Optional[int] = None
    config: Optional[Dict[str, Any]] = None
    is_active: bool = True


class ReportScheduleCreate(ReportScheduleBase):
    pass


class ReportScheduleUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=200)
    frequency: Optional[str] = Field(None, max_length=50)
    day_of_week: Optional[int] = Field(None, ge=0, le=6)
    day_of_month: Optional[int] = Field(None, ge=1, le=31)
    month: Optional[int] = Field(None, ge=1, le=12)
    time_of_day: Optional[str] = Field(None, max_length=10)
    recipients: Optional[List[str]] = None
    template_id: Optional[int] = None
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class ReportSchedule(ReportScheduleBase):
    id: int
    last_run_at: Optional[datetime] = None
    next_run_at: Optional[datetime] = None
    last_status: Optional[str] = None
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Dashboard Data Schemas
# ============================================================================

class ValuePipelineData(BaseModel):
    """Value pipeline dashboard data"""
    total_pipeline_value: float
    by_stage: Dict[str, float]
    by_ai_type: Dict[str, float]
    by_risk_tier: Dict[str, float]
    by_strategic_domain: Dict[str, float]
    top_initiatives: List[Dict[str, Any]]
    trend_data: List[Dict[str, Any]]


class DeliveredValueData(BaseModel):
    """Delivered value dashboard data"""
    total_delivered_value: float
    realization_rate: float
    by_benefit_type: Dict[str, float]
    by_initiative: List[Dict[str, Any]]
    roi_metrics: Dict[str, float]
    value_leakage_summary: Dict[str, Any]


class RiskExposureData(BaseModel):
    """Risk exposure dashboard data"""
    total_risk_score: float
    by_category: Dict[str, float]
    by_severity: Dict[str, int]
    high_risk_initiatives: List[Dict[str, Any]]
    mitigation_coverage: float
    risk_trends: List[Dict[str, Any]]


class StageDistributionData(BaseModel):
    """Stage distribution dashboard data"""
    by_stage: Dict[str, int]
    average_time_in_stage: Dict[str, float]
    bottlenecks: List[Dict[str, Any]]
    approval_rates: Dict[str, float]
    velocity_metrics: Dict[str, float]


class BottleneckData(BaseModel):
    """Bottleneck analysis data"""
    resource_bottlenecks: List[Dict[str, Any]]
    dependency_bottlenecks: List[Dict[str, Any]]
    approval_bottlenecks: List[Dict[str, Any]]
    data_platform_bottlenecks: List[Dict[str, Any]]
    vendor_bottlenecks: List[Dict[str, Any]]


class PortfolioHealthData(BaseModel):
    """Portfolio health dashboard data"""
    health_score: float
    total_initiatives: int
    active_initiatives: int
    total_budget: float
    total_value_delivered: float
    average_roi: float
    risk_score: float
    compliance_score: float
    key_metrics: Dict[str, Any]


# ============================================================================
# AI Agent Request/Response Schemas
# ============================================================================

class GenerateNarrativeRequest(BaseModel):
    """Request to generate executive narrative"""
    portfolio_data: Dict[str, Any]
    report_type: ReportType
    audience: str = "board"  # board, executive, technical
    include_charts: bool = True
    tone: str = "professional"  # professional, concise, detailed


class GenerateNarrativeResponse(BaseModel):
    """Response with generated narrative"""
    narrative: str
    key_points: List[str]
    chart_recommendations: List[Dict[str, Any]]
    confidence_score: float
    word_count: int


class ExplainTradeoffsRequest(BaseModel):
    """Request to explain portfolio trade-offs"""
    decision_context: Dict[str, Any]
    alternatives: List[Dict[str, Any]]
    constraints: Dict[str, Any]


class ExplainTradeoffsResponse(BaseModel):
    """Response with trade-off explanation"""
    explanation: str
    key_tradeoffs: List[Dict[str, Any]]
    recommendation: str
    confidence_score: float


class GenerateTalkingPointsRequest(BaseModel):
    """Request to generate talking points"""
    report_data: Dict[str, Any]
    audience: str = "board"
    max_points: int = 10


class GenerateTalkingPointsResponse(BaseModel):
    """Response with talking points"""
    talking_points: List[str]
    supporting_data: Dict[str, Any]
    anticipated_questions: List[str]


class GenerateBoardSummaryRequest(BaseModel):
    """Request to generate board summary"""
    portfolio_data: Dict[str, Any]
    period_start: datetime
    period_end: datetime
    max_paragraphs: int = 3


class GenerateBoardSummaryResponse(BaseModel):
    """Response with board summary"""
    summary: str
    highlights: List[str]
    concerns: List[str]
    recommendations: List[str]
    confidence_score: float


class GenerateRecommendationsRequest(BaseModel):
    """Request to generate strategic recommendations"""
    portfolio_analysis: Dict[str, Any]
    trends: List[Dict[str, Any]]
    gaps: List[str]


class GenerateRecommendationsResponse(BaseModel):
    """Response with recommendations"""
    recommendations: List[Dict[str, Any]]
    rationale: Dict[str, str]
    priority_order: List[int]
    estimated_impact: Dict[str, Any]


# ============================================================================
# Report Generation Request Schemas
# ============================================================================

class GenerateBoardSlidesRequest(BaseModel):
    """Request to generate board slides"""
    period_start: datetime
    period_end: datetime
    include_sections: Optional[List[str]] = None
    template_id: Optional[int] = None
    export_format: ExportFormat = ExportFormat.pptx


class GenerateStrategyBriefRequest(BaseModel):
    """Request to generate strategy brief"""
    period_start: datetime
    period_end: datetime
    template_id: Optional[int] = None


class GenerateQuarterlyReportRequest(BaseModel):
    """Request to generate quarterly report"""
    quarter: str
    year: int
    include_sections: Optional[List[str]] = None
    template_id: Optional[int] = None


# ============================================================================
# Export Schemas
# ============================================================================

class ExportReportRequest(BaseModel):
    """Request to export report"""
    report_id: int
    export_format: ExportFormat
    include_attachments: bool = False


class ExportReportResponse(BaseModel):
    """Response with export details"""
    file_path: str
    file_size_bytes: int
    download_url: str
    expires_at: datetime
