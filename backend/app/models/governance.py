from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class ComplianceStatus(str, enum.Enum):
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    IN_PROGRESS = "in_progress"
    NOT_APPLICABLE = "not_applicable"


class WorkflowStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"


class ApprovalDecision(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    APPROVED_WITH_CONDITIONS = "approved_with_conditions"
    REQUEST_CHANGES = "request_changes"
    REJECTED = "rejected"


class EvidenceType(str, enum.Enum):
    MODEL_CARD = "model_card"
    DPIA = "dpia"  # Data Privacy Impact Assessment
    BIAS_TESTING = "bias_testing"
    MONITORING_PLAN = "monitoring_plan"
    FAIRNESS_REPORT = "fairness_report"
    EXPLAINABILITY_DOC = "explainability_doc"
    AUDIT_REPORT = "audit_report"
    COMPLIANCE_CHECKLIST = "compliance_checklist"
    BUSINESS_CASE = "business_case"
    DATA_INVENTORY = "data_inventory"
    INCIDENT_RESPONSE = "incident_response"
    OTHER = "other"


class ComplianceRequirement(Base):
    __tablename__ = "compliance_requirements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    regulation = Column(String(255))  # e.g., "GDPR", "AI Act", "CCPA"
    category = Column(String(100))
    status = Column(Enum(ComplianceStatus), nullable=False, default=ComplianceStatus.IN_PROGRESS)
    requirements = Column(JSON)  # List of specific requirements
    evidence = Column(Text)
    responsible_party = Column(String(255))
    review_date = Column(DateTime)
    next_review_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    policy_type = Column(String(100))  # e.g., "Ethics", "Data Privacy", "Model Governance"
    content = Column(Text, nullable=False)
    version = Column(String(50), default="1.0")
    status = Column(String(50), default="active")  # active, draft, archived
    effective_date = Column(DateTime)
    review_frequency_days = Column(Integer, default=365)
    owner = Column(String(255))
    approved_by = Column(String(255))
    approval_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class GovernanceWorkflow(Base):
    """Define governance workflows with stages based on risk tier"""
    __tablename__ = "governance_workflows"

    id = Column(Integer, primary_key=True, index=True)
    initiative_id = Column(Integer, ForeignKey("initiatives.id"), nullable=False, unique=True)
    workflow_name = Column(String(255), nullable=False)
    risk_tier = Column(String(50), nullable=False)  # low, medium, high
    status = Column(Enum(WorkflowStatus), nullable=False, default=WorkflowStatus.NOT_STARTED)
    current_stage_id = Column(Integer, ForeignKey("workflow_stages.id"), nullable=True)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    initiative = relationship("Initiative", back_populates="governance_workflow")
    stages = relationship("WorkflowStage", back_populates="workflow", foreign_keys="WorkflowStage.workflow_id")
    current_stage = relationship("WorkflowStage", foreign_keys=[current_stage_id], post_update=True)


class WorkflowStage(Base):
    """Individual stages in a governance workflow"""
    __tablename__ = "workflow_stages"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("governance_workflows.id"), nullable=False)
    stage_name = Column(String(255), nullable=False)
    stage_order = Column(Integer, nullable=False)
    description = Column(Text)
    required_role = Column(String(100))  # Role required to approve this stage
    required_evidence = Column(JSON)  # List of required evidence types
    is_parallel = Column(Boolean, default=False)  # Can run in parallel with other stages
    status = Column(Enum(WorkflowStatus), nullable=False, default=WorkflowStatus.NOT_STARTED)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    workflow = relationship("GovernanceWorkflow", back_populates="stages", foreign_keys=[workflow_id])
    approvals = relationship("WorkflowApproval", back_populates="stage")


class WorkflowApproval(Base):
    """Track approvals at each workflow stage"""
    __tablename__ = "workflow_approvals"

    id = Column(Integer, primary_key=True, index=True)
    stage_id = Column(Integer, ForeignKey("workflow_stages.id"), nullable=False)
    approver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    approver_role = Column(String(100), nullable=True)  # Role of approver (for tracking)
    decision = Column(Enum(ApprovalDecision), nullable=False, default=ApprovalDecision.PENDING)
    comments = Column(Text)
    conditions = Column(Text)  # For "approved with conditions"
    requested_changes = Column(Text)  # For "request changes"
    decision_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    stage = relationship("WorkflowStage", back_populates="approvals")
    approver = relationship("User")


class EvidenceDocument(Base):
    """Evidence documents required for governance"""
    __tablename__ = "evidence_documents"

    id = Column(Integer, primary_key=True, index=True)
    initiative_id = Column(Integer, ForeignKey("initiatives.id"), nullable=False)
    document_type = Column(Enum(EvidenceType), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    file_path = Column(String(500))  # Path to uploaded file
    file_url = Column(String(500))  # URL if external
    version = Column(String(50), default="1.0")
    status = Column(String(50), default="draft")  # draft, submitted, approved, rejected
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approval_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    initiative = relationship("Initiative", back_populates="evidence_documents")
    uploader = relationship("User", foreign_keys=[uploaded_by])
    approver = relationship("User", foreign_keys=[approved_by])


class RiskMitigation(Base):
    """Mitigation controls for identified risks"""
    __tablename__ = "risk_mitigations"

    id = Column(Integer, primary_key=True, index=True)
    risk_id = Column(Integer, ForeignKey("risks.id"), nullable=False)
    control_name = Column(String(255), nullable=False)
    control_description = Column(Text, nullable=False)
    control_type = Column(String(100))  # preventive, detective, corrective
    implementation_status = Column(String(50), default="planned")  # planned, in_progress, implemented, verified
    owner = Column(String(255))
    target_date = Column(DateTime)
    completion_date = Column(DateTime)
    effectiveness = Column(String(50))  # low, medium, high
    verification_method = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    risk = relationship("Risk", back_populates="mitigations")
