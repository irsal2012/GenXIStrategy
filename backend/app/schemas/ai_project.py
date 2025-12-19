"""
Pydantic schemas for AI Project Management - Module 7
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# Enums
class GoNoGoDecisionEnum(str, Enum):
    PENDING = "pending"
    GO = "go"
    NO_GO = "no_go"


class DataFeasibilityStatusEnum(str, Enum):
    PENDING = "pending"
    ASSESSING = "assessing"
    FEASIBLE = "feasible"
    NOT_FEASIBLE = "not_feasible"


class PipelineStatusEnum(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class ModelStatusEnum(str, Enum):
    NOT_STARTED = "not_started"
    TRAINING = "training"
    COMPLETED = "completed"
    FAILED = "failed"


class DeploymentEnvironmentEnum(str, Enum):
    DEV = "dev"
    STAGING = "staging"
    PRODUCTION = "production"


class DeploymentTypeEnum(str, Enum):
    BATCH = "batch"
    REAL_TIME = "real_time"
    EDGE = "edge"


class DeploymentStatusEnum(str, Enum):
    PENDING = "pending"
    DEPLOYING = "deploying"
    DEPLOYED = "deployed"
    FAILED = "failed"
    RETIRED = "retired"


class MonitoringStatusEnum(str, Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    CRITICAL = "critical"


# Business Understanding Schemas
class BusinessUnderstandingBase(BaseModel):
    business_objectives: Optional[str] = None
    success_criteria: Optional[List[Dict[str, Any]]] = None
    stakeholder_requirements: Optional[List[Dict[str, Any]]] = None
    data_feasibility_status: DataFeasibilityStatusEnum = DataFeasibilityStatusEnum.PENDING
    data_sources_identified: Optional[List[Dict[str, Any]]] = None
    data_access_confirmed: bool = False
    compliance_cleared: bool = False
    feasibility_notes: Optional[str] = None
    go_no_go_decision: GoNoGoDecisionEnum = GoNoGoDecisionEnum.PENDING
    go_no_go_rationale: Optional[str] = None


class BusinessUnderstandingCreate(BusinessUnderstandingBase):
    initiative_id: int


class BusinessUnderstandingUpdate(BaseModel):
    business_objectives: Optional[str] = None
    success_criteria: Optional[List[Dict[str, Any]]] = None
    stakeholder_requirements: Optional[List[Dict[str, Any]]] = None
    data_feasibility_status: Optional[DataFeasibilityStatusEnum] = None
    data_sources_identified: Optional[List[Dict[str, Any]]] = None
    data_access_confirmed: Optional[bool] = None
    compliance_cleared: Optional[bool] = None
    feasibility_notes: Optional[str] = None
    go_no_go_decision: Optional[GoNoGoDecisionEnum] = None
    go_no_go_rationale: Optional[str] = None


class BusinessUnderstanding(BusinessUnderstandingBase):
    id: int
    initiative_id: int
    decision_date: Optional[datetime] = None
    decision_by: Optional[int] = None
    ai_feasibility_analysis: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None

    class Config:
        from_attributes = True


# Data Understanding Schemas
class DataUnderstandingBase(BaseModel):
    dataset_name: str
    dataset_location: Optional[str] = None
    dataset_description: Optional[str] = None
    dataset_size_gb: Optional[float] = None
    record_count: Optional[int] = None
    feature_count: Optional[int] = None
    data_quality_score: Optional[float] = Field(None, ge=0, le=100)
    missing_values_percentage: Optional[float] = Field(None, ge=0, le=100)
    duplicate_records_percentage: Optional[float] = Field(None, ge=0, le=100)
    data_profiling_results: Optional[Dict[str, Any]] = None
    data_exploration_notes: Optional[str] = None
    data_issues_identified: Optional[List[Dict[str, Any]]] = None
    status: PipelineStatusEnum = PipelineStatusEnum.NOT_STARTED


class DataUnderstandingCreate(DataUnderstandingBase):
    initiative_id: int


class DataUnderstandingUpdate(BaseModel):
    dataset_name: Optional[str] = None
    dataset_location: Optional[str] = None
    dataset_description: Optional[str] = None
    dataset_size_gb: Optional[float] = None
    record_count: Optional[int] = None
    feature_count: Optional[int] = None
    data_quality_score: Optional[float] = Field(None, ge=0, le=100)
    missing_values_percentage: Optional[float] = Field(None, ge=0, le=100)
    duplicate_records_percentage: Optional[float] = Field(None, ge=0, le=100)
    data_profiling_results: Optional[Dict[str, Any]] = None
    data_exploration_notes: Optional[str] = None
    data_issues_identified: Optional[List[Dict[str, Any]]] = None
    status: Optional[PipelineStatusEnum] = None


class DataUnderstanding(DataUnderstandingBase):
    id: int
    initiative_id: int
    ai_quality_assessment: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None

    class Config:
        from_attributes = True


# Data Preparation Schemas
class DataPreparationBase(BaseModel):
    step_name: str
    step_type: str
    step_description: Optional[str] = None
    step_order: int
    input_dataset: Optional[str] = None
    output_dataset: Optional[str] = None
    code_repository_link: Optional[str] = None
    notebook_link: Optional[str] = None
    pipeline_config: Optional[Dict[str, Any]] = None
    pipeline_status: PipelineStatusEnum = PipelineStatusEnum.NOT_STARTED
    data_quality_before: Optional[float] = Field(None, ge=0, le=100)
    data_quality_after: Optional[float] = Field(None, ge=0, le=100)
    records_processed: Optional[int] = None
    records_removed: Optional[int] = None


class DataPreparationCreate(DataPreparationBase):
    initiative_id: int


class DataPreparationUpdate(BaseModel):
    step_name: Optional[str] = None
    step_type: Optional[str] = None
    step_description: Optional[str] = None
    step_order: Optional[int] = None
    input_dataset: Optional[str] = None
    output_dataset: Optional[str] = None
    code_repository_link: Optional[str] = None
    notebook_link: Optional[str] = None
    pipeline_config: Optional[Dict[str, Any]] = None
    pipeline_status: Optional[PipelineStatusEnum] = None
    execution_start: Optional[datetime] = None
    execution_end: Optional[datetime] = None
    execution_time_minutes: Optional[float] = None
    data_quality_before: Optional[float] = Field(None, ge=0, le=100)
    data_quality_after: Optional[float] = Field(None, ge=0, le=100)
    records_processed: Optional[int] = None
    records_removed: Optional[int] = None
    execution_logs: Optional[str] = None
    error_message: Optional[str] = None


class DataPreparation(DataPreparationBase):
    id: int
    initiative_id: int
    execution_start: Optional[datetime] = None
    execution_end: Optional[datetime] = None
    execution_time_minutes: Optional[float] = None
    execution_logs: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None

    class Config:
        from_attributes = True


# Model Development Schemas
class ModelDevelopmentBase(BaseModel):
    model_name: str
    model_version: str
    model_description: Optional[str] = None
    model_type: str
    algorithm: str
    framework: Optional[str] = None
    hyperparameters: Optional[Dict[str, Any]] = None
    training_dataset: Optional[str] = None
    validation_dataset: Optional[str] = None
    training_config: Optional[Dict[str, Any]] = None
    training_metrics: Optional[Dict[str, Any]] = None
    final_metrics: Optional[Dict[str, Any]] = None
    model_artifact_location: Optional[str] = None
    model_size_mb: Optional[float] = None
    code_repository_link: Optional[str] = None
    status: ModelStatusEnum = ModelStatusEnum.NOT_STARTED


class ModelDevelopmentCreate(ModelDevelopmentBase):
    initiative_id: int


class ModelDevelopmentUpdate(BaseModel):
    model_name: Optional[str] = None
    model_version: Optional[str] = None
    model_description: Optional[str] = None
    model_type: Optional[str] = None
    algorithm: Optional[str] = None
    framework: Optional[str] = None
    hyperparameters: Optional[Dict[str, Any]] = None
    training_dataset: Optional[str] = None
    validation_dataset: Optional[str] = None
    training_config: Optional[Dict[str, Any]] = None
    training_start: Optional[datetime] = None
    training_end: Optional[datetime] = None
    training_duration_hours: Optional[float] = None
    training_metrics: Optional[Dict[str, Any]] = None
    final_metrics: Optional[Dict[str, Any]] = None
    model_artifact_location: Optional[str] = None
    model_size_mb: Optional[float] = None
    code_repository_link: Optional[str] = None
    status: Optional[ModelStatusEnum] = None


class ModelDevelopment(ModelDevelopmentBase):
    id: int
    initiative_id: int
    training_start: Optional[datetime] = None
    training_end: Optional[datetime] = None
    training_duration_hours: Optional[float] = None
    ai_hyperparameter_suggestions: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None

    class Config:
        from_attributes = True


# Model Evaluation Schemas
class ModelEvaluationBase(BaseModel):
    evaluation_name: str
    evaluation_dataset: Optional[str] = None
    evaluation_metrics: Dict[str, Any]
    confusion_matrix: Optional[Dict[str, Any]] = None
    roc_curve_data: Optional[Dict[str, Any]] = None
    feature_importance: Optional[Dict[str, Any]] = None
    performance_threshold: Optional[float] = None
    passed_threshold: bool = False
    evaluator_notes: Optional[str] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    recommendations: Optional[str] = None
    approved_for_deployment: bool = False


class ModelEvaluationCreate(ModelEvaluationBase):
    model_id: int


class ModelEvaluationUpdate(BaseModel):
    evaluation_name: Optional[str] = None
    evaluation_dataset: Optional[str] = None
    evaluation_metrics: Optional[Dict[str, Any]] = None
    confusion_matrix: Optional[Dict[str, Any]] = None
    roc_curve_data: Optional[Dict[str, Any]] = None
    feature_importance: Optional[Dict[str, Any]] = None
    performance_threshold: Optional[float] = None
    passed_threshold: Optional[bool] = None
    evaluator_notes: Optional[str] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    recommendations: Optional[str] = None
    approved_for_deployment: Optional[bool] = None


class ModelEvaluation(ModelEvaluationBase):
    id: int
    model_id: int
    evaluation_date: datetime
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    ai_interpretation: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None

    class Config:
        from_attributes = True


# Model Deployment Schemas
class ModelDeploymentBase(BaseModel):
    deployment_name: str
    deployment_environment: DeploymentEnvironmentEnum
    deployment_type: DeploymentTypeEnum
    endpoint_url: Optional[str] = None
    api_key: Optional[str] = None
    deployment_config: Optional[Dict[str, Any]] = None
    infrastructure_details: Optional[Dict[str, Any]] = None
    deployment_status: DeploymentStatusEnum = DeploymentStatusEnum.PENDING
    monitoring_enabled: bool = True
    alerting_enabled: bool = True
    alert_thresholds: Optional[Dict[str, Any]] = None
    rollback_plan: Optional[str] = None


class ModelDeploymentCreate(ModelDeploymentBase):
    model_id: int


class ModelDeploymentUpdate(BaseModel):
    deployment_name: Optional[str] = None
    deployment_environment: Optional[DeploymentEnvironmentEnum] = None
    deployment_type: Optional[DeploymentTypeEnum] = None
    endpoint_url: Optional[str] = None
    api_key: Optional[str] = None
    deployment_config: Optional[Dict[str, Any]] = None
    infrastructure_details: Optional[Dict[str, Any]] = None
    deployment_date: Optional[datetime] = None
    deployment_status: Optional[DeploymentStatusEnum] = None
    monitoring_enabled: Optional[bool] = None
    alerting_enabled: Optional[bool] = None
    alert_thresholds: Optional[Dict[str, Any]] = None
    rollback_plan: Optional[str] = None
    deployment_logs: Optional[str] = None
    error_message: Optional[str] = None


class ModelDeployment(ModelDeploymentBase):
    id: int
    model_id: int
    deployment_date: Optional[datetime] = None
    previous_deployment_id: Optional[int] = None
    deployment_logs: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deployed_by: Optional[int] = None

    class Config:
        from_attributes = True


# Model Monitoring Schemas
class ModelMonitoringBase(BaseModel):
    inference_count: int = 0
    average_latency_ms: Optional[float] = None
    error_rate: Optional[float] = Field(None, ge=0, le=100)
    throughput: Optional[float] = None
    performance_metrics: Optional[Dict[str, Any]] = None
    data_drift_score: Optional[float] = Field(None, ge=0, le=100)
    model_drift_score: Optional[float] = Field(None, ge=0, le=100)
    drift_details: Optional[Dict[str, Any]] = None
    alerts_triggered: Optional[List[Dict[str, Any]]] = None
    alert_count: int = 0
    status: MonitoringStatusEnum = MonitoringStatusEnum.HEALTHY
    health_score: Optional[float] = Field(None, ge=0, le=100)


class ModelMonitoringCreate(ModelMonitoringBase):
    deployment_id: int


class ModelMonitoring(ModelMonitoringBase):
    id: int
    deployment_id: int
    monitoring_date: datetime
    ai_drift_analysis: Optional[Dict[str, Any]] = None
    ai_recommendations: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


# AI Agent Request/Response Schemas
class AIFeasibilityAnalysisRequest(BaseModel):
    initiative_id: int
    business_objectives: str
    data_sources: List[Dict[str, Any]]
    compliance_requirements: Optional[List[str]] = None


class AIFeasibilityAnalysisResponse(BaseModel):
    feasibility_score: float = Field(..., ge=0, le=100)
    recommendation: str
    data_availability_assessment: Dict[str, Any]
    compliance_risks: List[Dict[str, Any]]
    estimated_timeline: str
    confidence: float = Field(..., ge=0, le=1)


class AIDataQualityRequest(BaseModel):
    dataset_id: int
    profiling_results: Dict[str, Any]


class AIDataQualityResponse(BaseModel):
    quality_score: float = Field(..., ge=0, le=100)
    issues_identified: List[Dict[str, Any]]
    recommendations: List[str]
    priority_actions: List[str]
    confidence: float = Field(..., ge=0, le=1)


class AIHyperparameterRequest(BaseModel):
    model_id: int
    model_type: str
    algorithm: str
    dataset_characteristics: Dict[str, Any]


class AIHyperparameterResponse(BaseModel):
    suggested_hyperparameters: Dict[str, Any]
    rationale: str
    expected_performance_range: Dict[str, float]
    confidence: float = Field(..., ge=0, le=1)


class AIModelInterpretationRequest(BaseModel):
    evaluation_id: int
    evaluation_metrics: Dict[str, Any]
    feature_importance: Optional[Dict[str, Any]] = None


class AIModelInterpretationResponse(BaseModel):
    interpretation: str
    key_insights: List[str]
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    confidence: float = Field(..., ge=0, le=1)


class AIDriftDetectionRequest(BaseModel):
    deployment_id: int
    current_metrics: Dict[str, Any]
    historical_metrics: List[Dict[str, Any]]


class AIDriftDetectionResponse(BaseModel):
    drift_detected: bool
    drift_type: str  # data_drift, model_drift, concept_drift
    drift_score: float = Field(..., ge=0, le=100)
    affected_features: List[str]
    recommendations: List[str]
    urgency: str  # low, medium, high, critical
    confidence: float = Field(..., ge=0, le=1)


# Dashboard Schemas
class ProjectOverviewDashboard(BaseModel):
    initiative_id: int
    initiative_title: str
    current_phase: str
    overall_progress: float = Field(..., ge=0, le=100)
    business_understanding_complete: bool
    data_understanding_complete: bool
    data_preparation_complete: bool
    modeling_complete: bool
    evaluation_complete: bool
    deployment_complete: bool
    monitoring_active: bool
    go_no_go_decision: str
    total_datasets: int
    total_models: int
    active_deployments: int
    health_status: str


class PhaseProgressSummary(BaseModel):
    phase_name: str
    status: str
    progress_percentage: float = Field(..., ge=0, le=100)
    start_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    key_metrics: Dict[str, Any]
