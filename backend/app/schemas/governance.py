from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.governance import (
    ComplianceStatus, WorkflowStatus, ApprovalDecision, EvidenceType
)


# ============================================================================
# Compliance Requirement Schemas
# ============================================================================

class ComplianceRequirementBase(BaseModel):
    title: str
    description: str
    regulation: Optional[str] = None
    category: Optional[str] = None
    status: ComplianceStatus = ComplianceStatus.IN_PROGRESS
    requirements: Optional[List[Dict[str, Any]]] = None
    evidence: Optional[str] = None
    responsible_party: Optional[str] = None
    review_date: Optional[datetime] = None
    next_review_date: Optional[datetime] = None


class ComplianceRequirementCreate(ComplianceRequirementBase):
    pass


class ComplianceRequirementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    regulation: Optional[str] = None
    category: Optional[str] = None
    status: Optional[ComplianceStatus] = None
    requirements: Optional[List[Dict[str, Any]]] = None
    evidence: Optional[str] = None
    responsible_party: Optional[str] = None
    review_date: Optional[datetime] = None
    next_review_date: Optional[datetime] = None


class ComplianceRequirementResponse(ComplianceRequirementBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Policy Schemas
# ============================================================================

class PolicyBase(BaseModel):
    title: str
    description: str
    policy_type: Optional[str] = None
    content: str
    version: str = "1.0"
    status: str = "active"
    effective_date: Optional[datetime] = None
    review_frequency_days: int = 365
    owner: Optional[str] = None
    approved_by: Optional[str] = None
    approval_date: Optional[datetime] = None


class PolicyCreate(PolicyBase):
    pass


class PolicyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    policy_type: Optional[str] = None
    content: Optional[str] = None
    version: Optional[str] = None
    status: Optional[str] = None
    effective_date: Optional[datetime] = None
    review_frequency_days: Optional[int] = None
    owner: Optional[str] = None
    approved_by: Optional[str] = None
    approval_date: Optional[datetime] = None


class PolicyResponse(PolicyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Governance Workflow Schemas
# ============================================================================

class GovernanceWorkflowBase(BaseModel):
    initiative_id: int
    workflow_name: str
    risk_tier: str
    status: WorkflowStatus = WorkflowStatus.NOT_STARTED


class GovernanceWorkflowCreate(GovernanceWorkflowBase):
    pass


class GovernanceWorkflowUpdate(BaseModel):
    workflow_name: Optional[str] = None
    risk_tier: Optional[str] = None
    status: Optional[WorkflowStatus] = None
    current_stage_id: Optional[int] = None


class GovernanceWorkflowResponse(GovernanceWorkflowBase):
    id: int
    current_stage_id: Optional[int] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Workflow Stage Schemas
# ============================================================================

class WorkflowStageBase(BaseModel):
    workflow_id: int
    stage_name: str
    stage_order: int
    description: Optional[str] = None
    required_role: Optional[str] = None
    required_evidence: Optional[List[str]] = None
    is_parallel: bool = False
    status: WorkflowStatus = WorkflowStatus.NOT_STARTED


class WorkflowStageCreate(WorkflowStageBase):
    pass


class WorkflowStageUpdate(BaseModel):
    stage_name: Optional[str] = None
    stage_order: Optional[int] = None
    description: Optional[str] = None
    required_role: Optional[str] = None
    required_evidence: Optional[List[str]] = None
    is_parallel: Optional[bool] = None
    status: Optional[WorkflowStatus] = None


class WorkflowStageResponse(WorkflowStageBase):
    id: int
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Workflow Approval Schemas
# ============================================================================

class WorkflowApprovalBase(BaseModel):
    stage_id: int
    approver_id: int
    decision: ApprovalDecision = ApprovalDecision.PENDING
    comments: Optional[str] = None
    conditions: Optional[str] = None
    requested_changes: Optional[str] = None


class WorkflowApprovalCreate(WorkflowApprovalBase):
    pass


class WorkflowApprovalUpdate(BaseModel):
    decision: Optional[ApprovalDecision] = None
    comments: Optional[str] = None
    conditions: Optional[str] = None
    requested_changes: Optional[str] = None
    decision_date: Optional[datetime] = None


class WorkflowApprovalResponse(WorkflowApprovalBase):
    id: int
    decision_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Evidence Document Schemas
# ============================================================================

class EvidenceDocumentBase(BaseModel):
    initiative_id: int
    document_type: EvidenceType
    title: str
    description: Optional[str] = None
    file_path: Optional[str] = None
    file_url: Optional[str] = None
    version: str = "1.0"
    status: str = "draft"


class EvidenceDocumentCreate(EvidenceDocumentBase):
    uploaded_by: int


class EvidenceDocumentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    file_path: Optional[str] = None
    file_url: Optional[str] = None
    version: Optional[str] = None
    status: Optional[str] = None
    approved_by: Optional[int] = None
    approval_date: Optional[datetime] = None


class EvidenceDocumentResponse(EvidenceDocumentBase):
    id: int
    uploaded_by: int
    approved_by: Optional[int] = None
    approval_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Risk Mitigation Schemas
# ============================================================================

class RiskMitigationBase(BaseModel):
    risk_id: int
    control_name: str
    control_description: str
    control_type: Optional[str] = None
    implementation_status: str = "planned"
    owner: Optional[str] = None
    target_date: Optional[datetime] = None
    effectiveness: Optional[str] = None
    verification_method: Optional[str] = None


class RiskMitigationCreate(RiskMitigationBase):
    pass


class RiskMitigationUpdate(BaseModel):
    control_name: Optional[str] = None
    control_description: Optional[str] = None
    control_type: Optional[str] = None
    implementation_status: Optional[str] = None
    owner: Optional[str] = None
    target_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    effectiveness: Optional[str] = None
    verification_method: Optional[str] = None


class RiskMitigationResponse(RiskMitigationBase):
    id: int
    completion_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# AI Agent Request/Response Schemas
# ============================================================================

class ComplianceCheckRequest(BaseModel):
    initiative_id: int
    check_type: str = "completeness"  # completeness, regulation_mapping, gap_analysis


class ComplianceCheckResponse(BaseModel):
    initiative_id: int
    completeness_score: float
    missing_artifacts: List[Dict[str, Any]]
    applicable_regulations: List[Dict[str, Any]]
    gaps: List[Dict[str, Any]]
    recommendations: List[str]
    ai_reasoning: str


class RiskAdvisorRequest(BaseModel):
    initiative_id: Optional[int] = None
    initiative_description: Optional[str] = None
    ai_type: Optional[str] = None
    data_sources: Optional[List[str]] = None


class RiskAdvisorResponse(BaseModel):
    identified_risks: List[Dict[str, Any]]
    risk_statements: List[str]
    recommended_controls: List[Dict[str, Any]]
    mitigation_strategies: List[Dict[str, Any]]
    ai_reasoning: str


class ModelCardGenerateRequest(BaseModel):
    initiative_id: int
    model_name: Optional[str] = None
    model_type: Optional[str] = None


class ModelCardGenerateResponse(BaseModel):
    model_card_template: Dict[str, Any]
    pre_filled_sections: Dict[str, Any]
    required_sections: List[str]
    suggested_metrics: List[str]


class WorkflowInitializeRequest(BaseModel):
    initiative_id: int
    risk_tier: str  # low, medium, high


class WorkflowInitializeResponse(BaseModel):
    workflow_id: int
    stages_created: List[Dict[str, Any]]
    message: str
