from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.governance import (
    GovernanceWorkflow, WorkflowStage, WorkflowApproval, 
    EvidenceDocument, RiskMitigation, Policy, ComplianceRequirement,
    WorkflowStatus, ApprovalDecision
)
from app.models.initiative import Initiative
from app.models.risk import Risk
from app.schemas.governance import (
    GovernanceWorkflowCreate, GovernanceWorkflowUpdate,
    WorkflowStageCreate, WorkflowStageUpdate,
    WorkflowApprovalCreate, WorkflowApprovalUpdate,
    EvidenceDocumentCreate, EvidenceDocumentUpdate,
    RiskMitigationCreate, RiskMitigationUpdate,
    PolicyCreate, PolicyUpdate,
    ComplianceRequirementCreate, ComplianceRequirementUpdate
)


class GovernanceService:
    """Service for managing governance workflows and compliance"""

    # ========================================================================
    # Governance Workflow Management
    # ========================================================================

    @staticmethod
    def initialize_workflow(db: Session, initiative_id: int, risk_tier: str) -> GovernanceWorkflow:
        """
        Initialize a governance workflow for an initiative based on risk tier.
        Creates workflow with appropriate stages.
        """
        # Check if workflow already exists
        existing = db.query(GovernanceWorkflow).filter(
            GovernanceWorkflow.initiative_id == initiative_id
        ).first()
        
        if existing:
            return existing

        # Create workflow
        workflow = GovernanceWorkflow(
            initiative_id=initiative_id,
            workflow_name=f"{risk_tier.upper()} Risk Governance Workflow",
            risk_tier=risk_tier,
            status=WorkflowStatus.NOT_STARTED,
            started_at=datetime.utcnow()
        )
        db.add(workflow)
        db.flush()

        # Create stages based on risk tier
        stages = GovernanceService._get_stages_for_risk_tier(risk_tier)
        
        for stage_data in stages:
            stage = WorkflowStage(
                workflow_id=workflow.id,
                stage_name=stage_data["name"],
                stage_order=stage_data["order"],
                description=stage_data["description"],
                required_role=stage_data["required_role"],
                required_evidence=stage_data["required_evidence"],
                is_parallel=stage_data.get("is_parallel", False),
                status=WorkflowStatus.NOT_STARTED
            )
            db.add(stage)

        db.commit()
        db.refresh(workflow)
        return workflow

    @staticmethod
    def _get_stages_for_risk_tier(risk_tier: str) -> List[Dict[str, Any]]:
        """Define stages based on risk tier"""
        
        if risk_tier == "low":
            return [
                {
                    "name": "Business Approval",
                    "order": 1,
                    "description": "Business stakeholder approval",
                    "required_role": "business_owner",
                    "required_evidence": ["business_case"]
                },
                {
                    "name": "Technical Review",
                    "order": 2,
                    "description": "Technical architecture review",
                    "required_role": "tech_lead",
                    "required_evidence": ["data_inventory"]
                },
                {
                    "name": "Production Sign-off",
                    "order": 3,
                    "description": "Final approval for production deployment",
                    "required_role": "ai_lead",
                    "required_evidence": []
                }
            ]
        
        elif risk_tier == "medium":
            return [
                {
                    "name": "Business Approval",
                    "order": 1,
                    "description": "Business stakeholder approval",
                    "required_role": "business_owner",
                    "required_evidence": ["business_case"]
                },
                {
                    "name": "Architecture Review",
                    "order": 2,
                    "description": "Technical architecture and design review",
                    "required_role": "architect",
                    "required_evidence": ["data_inventory"]
                },
                {
                    "name": "Data Privacy Assessment",
                    "order": 3,
                    "description": "Privacy impact assessment",
                    "required_role": "privacy_officer",
                    "required_evidence": ["dpia"]
                },
                {
                    "name": "Model Risk Review",
                    "order": 4,
                    "description": "Model risk assessment",
                    "required_role": "risk_officer",
                    "required_evidence": ["model_card", "bias_testing"]
                },
                {
                    "name": "Production Sign-off",
                    "order": 5,
                    "description": "Final approval for production deployment",
                    "required_role": "ai_lead",
                    "required_evidence": ["monitoring_plan"]
                }
            ]
        
        else:  # high risk
            return [
                {
                    "name": "Business Approval",
                    "order": 1,
                    "description": "Business stakeholder approval",
                    "required_role": "business_owner",
                    "required_evidence": ["business_case"]
                },
                {
                    "name": "Architecture Review",
                    "order": 2,
                    "description": "Technical architecture and design review",
                    "required_role": "architect",
                    "required_evidence": ["data_inventory"]
                },
                {
                    "name": "Data Privacy Impact Assessment",
                    "order": 3,
                    "description": "Comprehensive DPIA",
                    "required_role": "privacy_officer",
                    "required_evidence": ["dpia"]
                },
                {
                    "name": "Model Risk Assessment",
                    "order": 4,
                    "description": "Comprehensive model risk assessment",
                    "required_role": "risk_officer",
                    "required_evidence": ["model_card", "bias_testing"]
                },
                {
                    "name": "Bias & Fairness Testing",
                    "order": 5,
                    "description": "Comprehensive bias and fairness evaluation",
                    "required_role": "ethics_officer",
                    "required_evidence": ["fairness_report", "bias_testing"]
                },
                {
                    "name": "Legal/Regulatory Review",
                    "order": 6,
                    "description": "Legal and regulatory compliance review",
                    "required_role": "compliance_officer",
                    "required_evidence": ["compliance_checklist", "audit_report"]
                },
                {
                    "name": "Executive Sign-off",
                    "order": 7,
                    "description": "Executive approval for high-risk AI deployment",
                    "required_role": "executive",
                    "required_evidence": ["monitoring_plan", "incident_response"]
                }
            ]

    @staticmethod
    def get_workflow(db: Session, workflow_id: int) -> Optional[GovernanceWorkflow]:
        """Get workflow by ID"""
        return db.query(GovernanceWorkflow).filter(GovernanceWorkflow.id == workflow_id).first()

    @staticmethod
    def get_workflow_by_initiative(db: Session, initiative_id: int) -> Optional[GovernanceWorkflow]:
        """Get workflow for an initiative"""
        return db.query(GovernanceWorkflow).filter(
            GovernanceWorkflow.initiative_id == initiative_id
        ).first()

    @staticmethod
    def update_workflow(db: Session, workflow_id: int, workflow_update: GovernanceWorkflowUpdate) -> Optional[GovernanceWorkflow]:
        """Update workflow"""
        workflow = db.query(GovernanceWorkflow).filter(GovernanceWorkflow.id == workflow_id).first()
        if not workflow:
            return None

        update_data = workflow_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(workflow, field, value)

        workflow.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(workflow)
        return workflow

    # ========================================================================
    # Workflow Stage Management
    # ========================================================================

    @staticmethod
    def get_workflow_stages(db: Session, workflow_id: int) -> List[WorkflowStage]:
        """Get all stages for a workflow"""
        return db.query(WorkflowStage).filter(
            WorkflowStage.workflow_id == workflow_id
        ).order_by(WorkflowStage.stage_order).all()

    @staticmethod
    def get_stage(db: Session, stage_id: int) -> Optional[WorkflowStage]:
        """Get stage by ID"""
        return db.query(WorkflowStage).filter(WorkflowStage.id == stage_id).first()

    @staticmethod
    def update_stage(db: Session, stage_id: int, stage_update: WorkflowStageUpdate) -> Optional[WorkflowStage]:
        """Update workflow stage"""
        stage = db.query(WorkflowStage).filter(WorkflowStage.id == stage_id).first()
        if not stage:
            return None

        update_data = stage_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(stage, field, value)

        stage.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(stage)
        return stage

    @staticmethod
    def advance_workflow(db: Session, workflow_id: int) -> Optional[GovernanceWorkflow]:
        """
        Advance workflow to next stage if current stage is approved.
        Returns updated workflow or None if cannot advance.
        """
        workflow = db.query(GovernanceWorkflow).filter(GovernanceWorkflow.id == workflow_id).first()
        if not workflow:
            return None

        # Get current stage
        if workflow.current_stage_id:
            current_stage = db.query(WorkflowStage).filter(WorkflowStage.id == workflow.current_stage_id).first()
            if current_stage.status != WorkflowStatus.APPROVED:
                return None  # Cannot advance if current stage not approved

        # Get next stage
        stages = GovernanceService.get_workflow_stages(db, workflow_id)
        
        if not workflow.current_stage_id:
            # Start with first stage
            next_stage = stages[0] if stages else None
        else:
            # Find next stage
            current_order = next((s.stage_order for s in stages if s.id == workflow.current_stage_id), None)
            next_stage = next((s for s in stages if s.stage_order > current_order), None)

        if next_stage:
            workflow.current_stage_id = next_stage.id
            workflow.status = WorkflowStatus.IN_PROGRESS
            next_stage.status = WorkflowStatus.IN_PROGRESS
            next_stage.started_at = datetime.utcnow()
        else:
            # No more stages, workflow complete
            workflow.status = WorkflowStatus.COMPLETED
            workflow.completed_at = datetime.utcnow()

        db.commit()
        db.refresh(workflow)
        return workflow

    # ========================================================================
    # Approval Management
    # ========================================================================

    @staticmethod
    def create_approval(db: Session, approval_create: WorkflowApprovalCreate) -> WorkflowApproval:
        """Create approval record"""
        approval = WorkflowApproval(**approval_create.dict())
        db.add(approval)
        db.commit()
        db.refresh(approval)
        return approval

    @staticmethod
    def submit_approval(
        db: Session, 
        approval_id: int, 
        decision: ApprovalDecision,
        comments: Optional[str] = None,
        conditions: Optional[str] = None,
        requested_changes: Optional[str] = None
    ) -> Optional[WorkflowApproval]:
        """
        Submit approval decision. 
        IMPORTANT: This requires human decision - AI never auto-approves.
        """
        approval = db.query(WorkflowApproval).filter(WorkflowApproval.id == approval_id).first()
        if not approval:
            return None

        # Hard rule: Validate that this is a human decision
        if decision != ApprovalDecision.PENDING:
            approval.decision = decision
            approval.comments = comments
            approval.conditions = conditions
            approval.requested_changes = requested_changes
            approval.decision_date = datetime.utcnow()

            # Update stage status based on decision
            stage = db.query(WorkflowStage).filter(WorkflowStage.id == approval.stage_id).first()
            if stage:
                if decision == ApprovalDecision.APPROVED or decision == ApprovalDecision.APPROVED_WITH_CONDITIONS:
                    stage.status = WorkflowStatus.APPROVED
                    stage.completed_at = datetime.utcnow()
                elif decision == ApprovalDecision.REJECTED:
                    stage.status = WorkflowStatus.REJECTED
                elif decision == ApprovalDecision.REQUEST_CHANGES:
                    stage.status = WorkflowStatus.IN_PROGRESS

            db.commit()
            db.refresh(approval)

        return approval

    @staticmethod
    def get_stage_approvals(db: Session, stage_id: int) -> List[WorkflowApproval]:
        """Get all approvals for a stage"""
        return db.query(WorkflowApproval).filter(WorkflowApproval.stage_id == stage_id).all()

    # ========================================================================
    # Evidence Document Management
    # ========================================================================

    @staticmethod
    def create_evidence(db: Session, evidence_create: EvidenceDocumentCreate) -> EvidenceDocument:
        """Create evidence document"""
        evidence = EvidenceDocument(**evidence_create.dict())
        db.add(evidence)
        db.commit()
        db.refresh(evidence)
        return evidence

    @staticmethod
    def get_initiative_evidence(db: Session, initiative_id: int) -> List[EvidenceDocument]:
        """Get all evidence documents for an initiative"""
        return db.query(EvidenceDocument).filter(
            EvidenceDocument.initiative_id == initiative_id
        ).all()

    @staticmethod
    def update_evidence(db: Session, evidence_id: int, evidence_update: EvidenceDocumentUpdate) -> Optional[EvidenceDocument]:
        """Update evidence document"""
        evidence = db.query(EvidenceDocument).filter(EvidenceDocument.id == evidence_id).first()
        if not evidence:
            return None

        update_data = evidence_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(evidence, field, value)

        evidence.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(evidence)
        return evidence

    @staticmethod
    def delete_evidence(db: Session, evidence_id: int) -> bool:
        """Delete evidence document"""
        evidence = db.query(EvidenceDocument).filter(EvidenceDocument.id == evidence_id).first()
        if not evidence:
            return False

        db.delete(evidence)
        db.commit()
        return True

    # ========================================================================
    # Risk Mitigation Management
    # ========================================================================

    @staticmethod
    def create_mitigation(db: Session, mitigation_create: RiskMitigationCreate) -> RiskMitigation:
        """Create risk mitigation control"""
        mitigation = RiskMitigation(**mitigation_create.dict())
        db.add(mitigation)
        db.commit()
        db.refresh(mitigation)
        return mitigation

    @staticmethod
    def get_risk_mitigations(db: Session, risk_id: int) -> List[RiskMitigation]:
        """Get all mitigations for a risk"""
        return db.query(RiskMitigation).filter(RiskMitigation.risk_id == risk_id).all()

    @staticmethod
    def update_mitigation(db: Session, mitigation_id: int, mitigation_update: RiskMitigationUpdate) -> Optional[RiskMitigation]:
        """Update risk mitigation"""
        mitigation = db.query(RiskMitigation).filter(RiskMitigation.id == mitigation_id).first()
        if not mitigation:
            return None

        update_data = mitigation_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(mitigation, field, value)

        mitigation.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(mitigation)
        return mitigation

    # ========================================================================
    # Policy Management
    # ========================================================================

    @staticmethod
    def create_policy(db: Session, policy_create: PolicyCreate) -> Policy:
        """Create policy"""
        policy = Policy(**policy_create.dict())
        db.add(policy)
        db.commit()
        db.refresh(policy)
        return policy

    @staticmethod
    def get_policies(db: Session, policy_type: Optional[str] = None, status: Optional[str] = None) -> List[Policy]:
        """Get policies with optional filters"""
        query = db.query(Policy)
        
        if policy_type:
            query = query.filter(Policy.policy_type == policy_type)
        if status:
            query = query.filter(Policy.status == status)
        
        return query.all()

    @staticmethod
    def get_policy(db: Session, policy_id: int) -> Optional[Policy]:
        """Get policy by ID"""
        return db.query(Policy).filter(Policy.id == policy_id).first()

    @staticmethod
    def update_policy(db: Session, policy_id: int, policy_update: PolicyUpdate) -> Optional[Policy]:
        """Update policy"""
        policy = db.query(Policy).filter(Policy.id == policy_id).first()
        if not policy:
            return None

        update_data = policy_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(policy, field, value)

        policy.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(policy)
        return policy

    @staticmethod
    def delete_policy(db: Session, policy_id: int) -> bool:
        """Delete policy"""
        policy = db.query(Policy).filter(Policy.id == policy_id).first()
        if not policy:
            return False

        db.delete(policy)
        db.commit()
        return True

    # ========================================================================
    # Compliance Requirement Management
    # ========================================================================

    @staticmethod
    def create_compliance_requirement(db: Session, requirement_create: ComplianceRequirementCreate) -> ComplianceRequirement:
        """Create compliance requirement"""
        requirement = ComplianceRequirement(**requirement_create.dict())
        db.add(requirement)
        db.commit()
        db.refresh(requirement)
        return requirement

    @staticmethod
    def get_compliance_requirements(db: Session, regulation: Optional[str] = None) -> List[ComplianceRequirement]:
        """Get compliance requirements with optional filter"""
        query = db.query(ComplianceRequirement)
        
        if regulation:
            query = query.filter(ComplianceRequirement.regulation == regulation)
        
        return query.all()

    @staticmethod
    def update_compliance_requirement(
        db: Session, 
        requirement_id: int, 
        requirement_update: ComplianceRequirementUpdate
    ) -> Optional[ComplianceRequirement]:
        """Update compliance requirement"""
        requirement = db.query(ComplianceRequirement).filter(ComplianceRequirement.id == requirement_id).first()
        if not requirement:
            return None

        update_data = requirement_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(requirement, field, value)

        requirement.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(requirement)
        return requirement
