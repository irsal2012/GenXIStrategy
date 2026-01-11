from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.process_template import StepType, ExecutionStatus, ArtifactType


# Process Template Schemas
class StepConfig(BaseModel):
    """Configuration for a single step in the process"""
    name: str
    type: StepType
    order: int
    prompt_template: Optional[str] = None
    output_schema: Optional[Dict[str, Any]] = None
    validation_rules: Optional[Dict[str, Any]] = None
    description: Optional[str] = None


class ProcessTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_default: bool = False
    is_active: bool = True
    steps: List[StepConfig]


class ProcessTemplateCreate(ProcessTemplateBase):
    pass


class ProcessTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None
    steps: Optional[List[StepConfig]] = None


class ProcessTemplate(ProcessTemplateBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Process Execution Schemas
class ProcessExecutionCreate(BaseModel):
    template_id: int
    corporate_strategy_input: str = Field(..., description="The corporate strategy statement to process")


class ProcessExecutionUpdate(BaseModel):
    status: Optional[ExecutionStatus] = None
    current_step_index: Optional[int] = None
    completed_at: Optional[datetime] = None


class ProcessExecutionBase(BaseModel):
    id: int
    template_id: int
    corporate_strategy_input: str
    status: ExecutionStatus
    current_step_index: int
    created_by: int
    created_at: datetime
    completed_at: Optional[datetime] = None


class ProcessExecution(ProcessExecutionBase):
    template: Optional[ProcessTemplate] = None

    class Config:
        from_attributes = True


# Step Execution Schemas
class StepExecutionCreate(BaseModel):
    process_execution_id: int
    step_name: str
    step_type: StepType
    step_order: int
    input_data: Optional[Dict[str, Any]] = None


class StepExecutionUpdate(BaseModel):
    output_data: Optional[Dict[str, Any]] = None
    prompt_used: Optional[str] = None
    validation_results: Optional[Dict[str, Any]] = None
    validation_errors: Optional[List[Dict[str, Any]]] = None
    traceability_links: Optional[Dict[str, Any]] = None
    status: Optional[ExecutionStatus] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class StepExecutionBase(BaseModel):
    id: int
    process_execution_id: int
    step_name: str
    step_type: StepType
    step_order: int
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    prompt_used: Optional[str] = None
    validation_results: Optional[Dict[str, Any]] = None
    validation_errors: Optional[List[Dict[str, Any]]] = None
    traceability_links: Optional[Dict[str, Any]] = None
    status: ExecutionStatus
    repair_attempts: int
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class StepExecution(StepExecutionBase):
    class Config:
        from_attributes = True


# Strategy Artifact Schemas
class StrategyArtifactCreate(BaseModel):
    process_execution_id: int
    step_execution_id: int
    artifact_type: ArtifactType
    artifact_key: Optional[str] = None
    content: Dict[str, Any]
    parent_artifact_id: Optional[int] = None
    initiative_id: Optional[int] = None


class StrategyArtifact(BaseModel):
    id: int
    process_execution_id: int
    step_execution_id: int
    artifact_type: ArtifactType
    artifact_key: Optional[str] = None
    content: Dict[str, Any]
    parent_artifact_id: Optional[int] = None
    initiative_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Request/Response Schemas for API endpoints
class ExecuteStepRequest(BaseModel):
    """Request to execute a specific step"""
    input_data: Optional[Dict[str, Any]] = None


class ExecuteStepResponse(BaseModel):
    """Response from step execution"""
    success: bool
    step_execution: StepExecution
    artifacts: List[StrategyArtifact]
    error: Optional[str] = None


class ValidateStepRequest(BaseModel):
    """Request to validate step output"""
    step_execution_id: int


class ValidateStepResponse(BaseModel):
    """Response from validation"""
    success: bool
    is_valid: bool
    validation_results: Dict[str, Any]
    validation_errors: List[Dict[str, Any]]
    suggestions: Optional[List[str]] = None


class RepairStepRequest(BaseModel):
    """Request to repair invalid step output"""
    step_execution_id: int


class RepairStepResponse(BaseModel):
    """Response from repair attempt"""
    success: bool
    repaired_data: Optional[Dict[str, Any]] = None
    validation_results: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class ExportExecutionResponse(BaseModel):
    """Full export of process execution with traceability"""
    process_execution_id: int
    template_name: str
    corporate_strategy: str
    execution_date: datetime
    status: ExecutionStatus
    steps: List[Dict[str, Any]]
    artifacts: List[Dict[str, Any]]
    initiatives: List[Dict[str, Any]]
    traceability_map: Dict[str, Any]


class ProcessExecutionDetail(ProcessExecution):
    """Detailed view of process execution with all related data"""
    step_executions: List[StepExecution]
    artifacts: List[StrategyArtifact]
    template: ProcessTemplate

    class Config:
        from_attributes = True
