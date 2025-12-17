from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class DimensionType(str, Enum):
    VALUE = "value"
    FEASIBILITY = "feasibility"
    RISK = "risk"
    STRATEGIC_ALIGNMENT = "strategic_alignment"


class CriteriaType(str, Enum):
    NUMERIC = "numeric"
    PERCENTAGE = "percentage"
    BOOLEAN = "boolean"
    CALCULATED = "calculated"


# Scoring Criteria Schemas
class ScoringCriteriaBase(BaseModel):
    name: str
    description: Optional[str] = None
    criteria_type: CriteriaType = CriteriaType.NUMERIC
    weight: float = Field(..., ge=0, le=100)
    min_value: float = 0.0
    max_value: float = 10.0
    is_inverted: bool = False
    calculation_formula: Optional[str] = None
    data_source_field: Optional[str] = None
    order: int = 0
    help_text: Optional[str] = None


class ScoringCriteriaCreate(ScoringCriteriaBase):
    dimension_id: int


class ScoringCriteriaUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    weight: Optional[float] = Field(None, ge=0, le=100)
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    is_inverted: Optional[bool] = None
    calculation_formula: Optional[str] = None
    help_text: Optional[str] = None


class ScoringCriteria(ScoringCriteriaBase):
    id: int
    dimension_id: int

    class Config:
        from_attributes = True


# Scoring Dimension Schemas
class ScoringDimensionBase(BaseModel):
    dimension_type: DimensionType
    name: str
    description: Optional[str] = None
    weight: float = Field(..., ge=0, le=100)
    color: Optional[str] = None
    icon: Optional[str] = None
    order: int = 0


class ScoringDimensionCreate(ScoringDimensionBase):
    model_version_id: int
    criteria: Optional[List[ScoringCriteriaBase]] = []


class ScoringDimensionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    weight: Optional[float] = Field(None, ge=0, le=100)
    color: Optional[str] = None
    icon: Optional[str] = None


class ScoringDimension(ScoringDimensionBase):
    id: int
    model_version_id: int
    criteria: List[ScoringCriteria] = []

    class Config:
        from_attributes = True


# Scoring Model Version Schemas
class ScoringModelVersionBase(BaseModel):
    name: str
    description: Optional[str] = None
    version: str
    value_weight: float = Field(40.0, ge=0, le=100)
    feasibility_weight: float = Field(35.0, ge=0, le=100)
    risk_weight: float = Field(25.0, ge=0, le=100)
    strategic_alignment_weight: float = Field(0.0, ge=0, le=100)

    @validator('strategic_alignment_weight', always=True)
    def validate_weights_sum(cls, v, values):
        total = values.get('value_weight', 0) + values.get('feasibility_weight', 0) + values.get('risk_weight', 0) + v
        if abs(total - 100.0) > 0.01:  # Allow small floating point errors
            raise ValueError(f'Dimension weights must sum to 100, got {total}')
        return v


class ScoringModelVersionCreate(ScoringModelVersionBase):
    dimensions: Optional[List[ScoringDimensionCreate]] = []


class ScoringModelVersionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    value_weight: Optional[float] = Field(None, ge=0, le=100)
    feasibility_weight: Optional[float] = Field(None, ge=0, le=100)
    risk_weight: Optional[float] = Field(None, ge=0, le=100)
    strategic_alignment_weight: Optional[float] = Field(None, ge=0, le=100)


class ScoringModelVersion(ScoringModelVersionBase):
    id: int
    is_active: bool
    created_by_id: Optional[int] = None
    created_at: datetime
    activated_at: Optional[datetime] = None
    dimensions: List[ScoringDimension] = []

    class Config:
        from_attributes = True


# Initiative Score Schemas
class InitiativeScoreBase(BaseModel):
    overall_score: float = Field(..., ge=0, le=10)
    value_score: float = Field(0.0, ge=0, le=10)
    feasibility_score: float = Field(0.0, ge=0, le=10)
    risk_score: float = Field(0.0, ge=0, le=10)
    strategic_alignment_score: float = Field(0.0, ge=0, le=10)
    criteria_scores: Optional[Dict[str, float]] = {}
    score_justification: Optional[str] = None
    strengths: Optional[List[str]] = []
    weaknesses: Optional[List[str]] = []
    recommendations: Optional[List[str]] = []
    confidence_score: Optional[float] = Field(None, ge=0, le=100)
    calculation_method: str = "manual"


class InitiativeScoreCreate(InitiativeScoreBase):
    initiative_id: int
    model_version_id: int


class InitiativeScoreUpdate(BaseModel):
    overall_score: Optional[float] = Field(None, ge=0, le=10)
    value_score: Optional[float] = Field(None, ge=0, le=10)
    feasibility_score: Optional[float] = Field(None, ge=0, le=10)
    risk_score: Optional[float] = Field(None, ge=0, le=10)
    strategic_alignment_score: Optional[float] = Field(None, ge=0, le=10)
    criteria_scores: Optional[Dict[str, float]] = None
    score_justification: Optional[str] = None


class InitiativeScore(InitiativeScoreBase):
    id: int
    initiative_id: int
    model_version_id: int
    priority_rank: Optional[int] = None
    calculated_at: datetime
    calculated_by_id: Optional[int] = None

    class Config:
        from_attributes = True


# Scenario Simulation Schemas
class ScenarioSimulationBase(BaseModel):
    name: str
    description: Optional[str] = None
    budget_constraint: Optional[float] = None
    capacity_constraint: Optional[int] = None
    timeline_constraint: Optional[int] = None
    target_portfolio_mix: Optional[Dict[str, float]] = None
    risk_tolerance: Optional[str] = "medium"


class ScenarioSimulationCreate(ScenarioSimulationBase):
    pass


class ScenarioSimulationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    budget_constraint: Optional[float] = None
    capacity_constraint: Optional[int] = None
    timeline_constraint: Optional[int] = None
    target_portfolio_mix: Optional[Dict[str, float]] = None
    risk_tolerance: Optional[str] = None


class ScenarioSimulation(ScenarioSimulationBase):
    id: int
    selected_initiatives: Optional[List[int]] = []
    total_budget_allocated: Optional[float] = None
    total_expected_roi: Optional[float] = None
    portfolio_mix: Optional[Dict[str, float]] = None
    risk_distribution: Optional[Dict[str, int]] = None
    optimization_strategy: Optional[str] = None
    trade_offs: Optional[List[str]] = []
    alternative_scenarios: Optional[List[Dict[str, Any]]] = []
    created_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Initiative Comparison Schemas
class InitiativeComparisonBase(BaseModel):
    initiative_a_id: int
    initiative_b_id: int


class InitiativeComparisonCreate(InitiativeComparisonBase):
    pass


class InitiativeComparison(InitiativeComparisonBase):
    id: int
    winner_id: Optional[int] = None
    score_difference: Optional[float] = None
    dimension_comparison: Optional[Dict[str, float]] = None
    key_differentiators: Optional[List[str]] = []
    justification: Optional[str] = None
    recommendation: Optional[str] = None
    compared_at: datetime
    compared_by_id: Optional[int] = None

    class Config:
        from_attributes = True


# Request/Response Schemas
class CalculateScoreRequest(BaseModel):
    initiative_id: int
    use_ai: bool = True
    manual_scores: Optional[Dict[str, float]] = None


class CalculateScoreResponse(BaseModel):
    success: bool
    score: Optional[InitiativeScore] = None
    message: Optional[str] = None


class RankingResponse(BaseModel):
    initiative_id: int
    title: str
    rank: int
    overall_score: float
    value_score: float
    feasibility_score: float
    risk_score: float
    strategic_alignment_score: float
    justification: Optional[str] = None


class PortfolioBalanceResponse(BaseModel):
    total_initiatives: int
    by_ai_type: Dict[str, int]
    by_risk_tier: Dict[str, int]
    by_strategic_domain: Dict[str, int]
    by_status: Dict[str, int]
    total_budget: float
    total_expected_roi: float
    recommendations: Optional[List[str]] = []


class ComparisonRequest(BaseModel):
    initiative_a_id: int
    initiative_b_id: int


class SimulatePortfolioRequest(BaseModel):
    scenario: ScenarioSimulationCreate
    initiative_ids: Optional[List[int]] = None  # If None, consider all active initiatives
