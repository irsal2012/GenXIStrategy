from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.benefits import (
    KPICategory, MeasurementFrequency, BenefitType, BenefitStatus,
    LeakageStatus, LeakageSeverity, PIRStatus
)


# KPI Baseline Schemas
class KPIBaselineBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    category: KPICategory
    baseline_value: float
    target_value: float
    unit: str = Field(..., max_length=50)
    measurement_frequency: MeasurementFrequency
    owner: Optional[str] = Field(None, max_length=255)
    baseline_date: datetime
    target_date: datetime


class KPIBaselineCreate(KPIBaselineBase):
    initiative_id: int


class KPIBaselineUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    category: Optional[KPICategory] = None
    baseline_value: Optional[float] = None
    target_value: Optional[float] = None
    unit: Optional[str] = Field(None, max_length=50)
    measurement_frequency: Optional[MeasurementFrequency] = None
    owner: Optional[str] = Field(None, max_length=255)
    baseline_date: Optional[datetime] = None
    target_date: Optional[datetime] = None


class KPIBaseline(KPIBaselineBase):
    id: int
    initiative_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# KPI Measurement Schemas
class KPIMeasurementBase(BaseModel):
    measurement_date: datetime
    actual_value: float
    notes: Optional[str] = None
    recorded_by: Optional[str] = Field(None, max_length=255)


class KPIMeasurementCreate(KPIMeasurementBase):
    kpi_baseline_id: int


class KPIMeasurement(KPIMeasurementBase):
    id: int
    kpi_baseline_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class KPITrend(BaseModel):
    kpi_id: int
    kpi_name: str
    baseline_value: float
    target_value: float
    current_value: float
    unit: str
    progress_percentage: float
    trend: str  # "improving", "declining", "stable"
    measurements: List[KPIMeasurement]


# Benefit Realization Schemas
class BenefitRealizationBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    benefit_type: BenefitType
    status: BenefitStatus = BenefitStatus.PLANNED
    expected_value: float
    realized_value: float = 0.0
    currency: str = Field("USD", max_length=10)
    expected_realization_date: datetime
    actual_realization_date: Optional[datetime] = None
    owner: Optional[str] = Field(None, max_length=255)
    dependencies: Optional[List[str]] = None
    assumptions: Optional[List[str]] = None


class BenefitRealizationCreate(BenefitRealizationBase):
    initiative_id: int


class BenefitRealizationUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    benefit_type: Optional[BenefitType] = None
    status: Optional[BenefitStatus] = None
    expected_value: Optional[float] = None
    realized_value: Optional[float] = None
    currency: Optional[str] = Field(None, max_length=10)
    expected_realization_date: Optional[datetime] = None
    actual_realization_date: Optional[datetime] = None
    owner: Optional[str] = None
    dependencies: Optional[List[str]] = None
    assumptions: Optional[List[str]] = None


class BenefitRealization(BenefitRealizationBase):
    id: int
    initiative_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BenefitsSummary(BaseModel):
    total_expected_value: float
    total_realized_value: float
    realization_percentage: float
    benefits_by_type: Dict[str, Dict[str, float]]
    benefits_by_status: Dict[str, int]
    at_risk_benefits: List[BenefitRealization]


# Benefit Confidence Score Schemas
class BenefitConfidenceScoreBase(BaseModel):
    score_date: datetime
    confidence_level: float = Field(..., ge=0, le=100)
    factors: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    scored_by: Optional[str] = Field(None, max_length=255)


class BenefitConfidenceScoreCreate(BenefitConfidenceScoreBase):
    benefit_realization_id: int


class BenefitConfidenceScore(BenefitConfidenceScoreBase):
    id: int
    benefit_realization_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Value Leakage Schemas
class ValueLeakageBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: str
    severity: LeakageSeverity
    status: LeakageStatus = LeakageStatus.IDENTIFIED
    estimated_impact: Optional[float] = None
    currency: str = Field("USD", max_length=10)
    root_cause: Optional[str] = None
    mitigation_plan: Optional[str] = None
    identified_date: datetime
    resolved_date: Optional[datetime] = None
    identified_by: Optional[str] = Field(None, max_length=255)
    assigned_to: Optional[str] = Field(None, max_length=255)


class ValueLeakageCreate(ValueLeakageBase):
    initiative_id: int


class ValueLeakageUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    severity: Optional[LeakageSeverity] = None
    status: Optional[LeakageStatus] = None
    estimated_impact: Optional[float] = None
    currency: Optional[str] = Field(None, max_length=10)
    root_cause: Optional[str] = None
    mitigation_plan: Optional[str] = None
    resolved_date: Optional[datetime] = None
    assigned_to: Optional[str] = None


class ValueLeakage(ValueLeakageBase):
    id: int
    initiative_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Post-Implementation Review Schemas
class PostImplementationReviewBase(BaseModel):
    title: str = Field(..., max_length=255)
    status: PIRStatus = PIRStatus.DRAFT
    review_date: datetime
    executive_summary: Optional[str] = None
    objectives_met: Optional[List[Dict[str, Any]]] = None
    objectives_analysis: Optional[str] = None
    benefits_summary: Optional[Dict[str, Any]] = None
    benefits_analysis: Optional[str] = None
    what_went_well: Optional[List[str]] = None
    what_went_wrong: Optional[List[str]] = None
    lessons_learned: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    stakeholder_feedback: Optional[List[Dict[str, Any]]] = None
    prepared_by: Optional[str] = Field(None, max_length=255)
    reviewed_by: Optional[str] = Field(None, max_length=255)
    approved_by: Optional[str] = Field(None, max_length=255)


class PostImplementationReviewCreate(PostImplementationReviewBase):
    initiative_id: int


class PostImplementationReviewUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    status: Optional[PIRStatus] = None
    review_date: Optional[datetime] = None
    executive_summary: Optional[str] = None
    objectives_met: Optional[List[Dict[str, Any]]] = None
    objectives_analysis: Optional[str] = None
    benefits_summary: Optional[Dict[str, Any]] = None
    benefits_analysis: Optional[str] = None
    what_went_well: Optional[List[str]] = None
    what_went_wrong: Optional[List[str]] = None
    lessons_learned: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    stakeholder_feedback: Optional[List[Dict[str, Any]]] = None
    reviewed_by: Optional[str] = None
    approved_by: Optional[str] = None


class PostImplementationReview(PostImplementationReviewBase):
    id: int
    initiative_id: int
    submitted_date: Optional[datetime] = None
    approved_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# AI Agent Request/Response Schemas
class VarianceExplanationRequest(BaseModel):
    kpi_id: int
    expected_value: float
    actual_value: float
    context: Optional[str] = None


class VarianceExplanationResponse(BaseModel):
    explanation: str
    contributing_factors: List[str]
    recommendations: List[str]


class LeakageDetectionRequest(BaseModel):
    initiative_id: int


class LeakageDetectionResponse(BaseModel):
    potential_leakages: List[Dict[str, Any]]
    risk_areas: List[str]
    recommendations: List[str]


class PIRInsightsRequest(BaseModel):
    initiative_id: int
    objectives: List[str]
    benefits_data: Dict[str, Any]
    challenges: Optional[List[str]] = None


class PIRInsightsResponse(BaseModel):
    key_insights: List[str]
    success_factors: List[str]
    improvement_areas: List[str]
    lessons_learned: List[str]
    recommendations: List[str]


class RealizationForecastRequest(BaseModel):
    benefit_id: int
    historical_data: List[Dict[str, Any]]


class RealizationForecastResponse(BaseModel):
    forecast_value: float
    confidence_interval: Dict[str, float]
    forecast_date: datetime
    assumptions: List[str]


class BenchmarkRequest(BaseModel):
    initiative_id: int
    metrics: List[str]


class BenchmarkResponse(BaseModel):
    initiative_performance: Dict[str, float]
    industry_average: Dict[str, float]
    percentile_rank: Dict[str, float]
    insights: List[str]


# Dashboard Schemas
class InitiativeDashboard(BaseModel):
    initiative_id: int
    initiative_name: str
    kpis: List[KPIBaseline]
    kpi_trends: List[KPITrend]
    benefits: List[BenefitRealization]
    benefits_summary: BenefitsSummary
    leakages: List[ValueLeakage]
    recent_pirs: List[PostImplementationReview]


class PortfolioDashboard(BaseModel):
    total_initiatives: int
    total_expected_value: float
    total_realized_value: float
    overall_realization_rate: float
    initiatives_by_status: Dict[str, int]
    top_performing_initiatives: List[Dict[str, Any]]
    at_risk_initiatives: List[Dict[str, Any]]
    total_leakages: int
    leakages_by_severity: Dict[str, int]
