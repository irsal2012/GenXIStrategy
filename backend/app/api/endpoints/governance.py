from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.governance import ApprovalDecision
from app.schemas.governance import (
    # Workflow schemas
    GovernanceWorkflowCreate, GovernanceWorkflowUpdate, GovernanceWorkflowResponse,
    WorkflowStageResponse, WorkflowStageUpdate,
    WorkflowApprovalCreate, WorkflowApprovalUpdate, WorkflowApprovalResponse,
    # Evidence schemas
    EvidenceDocumentCreate, EvidenceDocumentUpdate, EvidenceDocumentResponse,
    # Risk mitigation schemas
    RiskMitigationCreate, RiskMitigationUpdate, RiskMitigationResponse,
    # Policy schemas
    PolicyCreate, PolicyUpdate, PolicyResponse,
    # Compliance schemas
    ComplianceRequirementCreate, ComplianceRequirementUpdate, ComplianceRequirementResponse,
    # AI Agent schemas
    ComplianceCheckRequest, ComplianceCheckResponse,
    RiskAdvisorRequest, RiskAdvisorResponse,
    ModelCardGenerateRequest, ModelCardGenerateResponse,
    WorkflowInitializeRequest, WorkflowInitializeResponse
)
from app.services.governance_service import GovernanceService
from app.services.openai_service import openai_service
import json

router = APIRouter()


# ============================================================================
# Governance Workflow Endpoints
# ============================================================================

@router.post("/workflows/initialize", response_model=WorkflowInitializeResponse, status_code=status.HTTP_201_CREATED)
async def initialize_workflow(
    request: WorkflowInitializeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Initialize a governance workflow for an initiative based on risk tier.
    Creates workflow with appropriate stages (3 for low, 5 for medium, 7 for high risk).
    """
    try:
        workflow = GovernanceService.initialize_workflow(
            db=db,
            initiative_id=request.initiative_id,
            risk_tier=request.risk_tier
        )
        
        stages = GovernanceService.get_workflow_stages(db, workflow.id)
        
        return WorkflowInitializeResponse(
            workflow_id=workflow.id,
            stages_created=[
                {
                    "id": stage.id,
                    "name": stage.stage_name,
                    "order": stage.stage_order,
                    "required_role": stage.required_role,
                    "required_evidence": stage.required_evidence
                }
                for stage in stages
            ],
            message=f"Workflow initialized with {len(stages)} stages for {request.risk_tier} risk initiative"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/workflows/initiative/{initiative_id}", response_model=GovernanceWorkflowResponse)
async def get_workflow_by_initiative(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get governance workflow for an initiative"""
    workflow = GovernanceService.get_workflow_by_initiative(db, initiative_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow


@router.get("/workflows/{workflow_id}", response_model=GovernanceWorkflowResponse)
async def get_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get workflow by ID"""
    workflow = GovernanceService.get_workflow(db, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow


@router.put("/workflows/{workflow_id}", response_model=GovernanceWorkflowResponse)
async def update_workflow(
    workflow_id: int,
    workflow_update: GovernanceWorkflowUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update workflow"""
    workflow = GovernanceService.update_workflow(db, workflow_id, workflow_update)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow


@router.post("/workflows/{workflow_id}/advance", response_model=GovernanceWorkflowResponse)
async def advance_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Advance workflow to next stage if current stage is approved.
    Returns updated workflow or error if cannot advance.
    """
    workflow = GovernanceService.advance_workflow(db, workflow_id)
    if not workflow:
        raise HTTPException(status_code=400, detail="Cannot advance workflow. Current stage may not be approved.")
    return workflow


# ============================================================================
# Workflow Stage Endpoints
# ============================================================================

@router.get("/workflows/{workflow_id}/stages", response_model=List[WorkflowStageResponse])
async def get_workflow_stages(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all stages for a workflow"""
    stages = GovernanceService.get_workflow_stages(db, workflow_id)
    return stages


@router.get("/stages/{stage_id}", response_model=WorkflowStageResponse)
async def get_stage(
    stage_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get stage by ID"""
    stage = GovernanceService.get_stage(db, stage_id)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    return stage


@router.put("/stages/{stage_id}", response_model=WorkflowStageResponse)
async def update_stage(
    stage_id: int,
    stage_update: WorkflowStageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update workflow stage"""
    stage = GovernanceService.update_stage(db, stage_id, stage_update)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    return stage


# ============================================================================
# Approval Endpoints
# ============================================================================

@router.post("/approvals", response_model=WorkflowApprovalResponse, status_code=status.HTTP_201_CREATED)
async def create_approval(
    approval_create: WorkflowApprovalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create approval record for a stage"""
    approval = GovernanceService.create_approval(db, approval_create)
    return approval


@router.post("/approvals/{approval_id}/submit")
async def submit_approval(
    approval_id: int,
    decision: ApprovalDecision,
    comments: Optional[str] = None,
    conditions: Optional[str] = None,
    requested_changes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit approval decision.
    IMPORTANT: This requires human decision - AI never auto-approves.
    """
    approval = GovernanceService.submit_approval(
        db=db,
        approval_id=approval_id,
        decision=decision,
        comments=comments,
        conditions=conditions,
        requested_changes=requested_changes
    )
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    return approval


@router.get("/stages/{stage_id}/approvals", response_model=List[WorkflowApprovalResponse])
async def get_stage_approvals(
    stage_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all approvals for a stage"""
    approvals = GovernanceService.get_stage_approvals(db, stage_id)
    return approvals


# ============================================================================
# Evidence Document Endpoints
# ============================================================================

@router.post("/evidence", response_model=EvidenceDocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_evidence(
    evidence_create: EvidenceDocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create evidence document"""
    evidence = GovernanceService.create_evidence(db, evidence_create)
    return evidence


@router.get("/evidence/initiative/{initiative_id}", response_model=List[EvidenceDocumentResponse])
async def get_initiative_evidence(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all evidence documents for an initiative"""
    evidence = GovernanceService.get_initiative_evidence(db, initiative_id)
    return evidence


@router.put("/evidence/{evidence_id}", response_model=EvidenceDocumentResponse)
async def update_evidence(
    evidence_id: int,
    evidence_update: EvidenceDocumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update evidence document"""
    evidence = GovernanceService.update_evidence(db, evidence_id, evidence_update)
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence document not found")
    return evidence


@router.delete("/evidence/{evidence_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_evidence(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete evidence document"""
    success = GovernanceService.delete_evidence(db, evidence_id)
    if not success:
        raise HTTPException(status_code=404, detail="Evidence document not found")
    return None


# ============================================================================
# Risk Mitigation Endpoints
# ============================================================================

@router.post("/risks/{risk_id}/mitigations", response_model=RiskMitigationResponse, status_code=status.HTTP_201_CREATED)
async def create_mitigation(
    risk_id: int,
    mitigation_create: RiskMitigationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create risk mitigation control"""
    mitigation = GovernanceService.create_mitigation(db, mitigation_create)
    return mitigation


@router.get("/risks/{risk_id}/mitigations", response_model=List[RiskMitigationResponse])
async def get_risk_mitigations(
    risk_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all mitigations for a risk"""
    mitigations = GovernanceService.get_risk_mitigations(db, risk_id)
    return mitigations


@router.put("/mitigations/{mitigation_id}", response_model=RiskMitigationResponse)
async def update_mitigation(
    mitigation_id: int,
    mitigation_update: RiskMitigationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update risk mitigation"""
    mitigation = GovernanceService.update_mitigation(db, mitigation_id, mitigation_update)
    if not mitigation:
        raise HTTPException(status_code=404, detail="Mitigation not found")
    return mitigation


# ============================================================================
# Policy Endpoints
# ============================================================================

@router.post("/policies", response_model=PolicyResponse, status_code=status.HTTP_201_CREATED)
async def create_policy(
    policy_create: PolicyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create policy"""
    policy = GovernanceService.create_policy(db, policy_create)
    return policy


@router.get("/policies", response_model=List[PolicyResponse])
async def get_policies(
    policy_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get policies with optional filters"""
    policies = GovernanceService.get_policies(db, policy_type, status)
    return policies


@router.get("/policies/{policy_id}", response_model=PolicyResponse)
async def get_policy(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get policy by ID"""
    policy = GovernanceService.get_policy(db, policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy


@router.put("/policies/{policy_id}", response_model=PolicyResponse)
async def update_policy(
    policy_id: int,
    policy_update: PolicyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update policy"""
    policy = GovernanceService.update_policy(db, policy_id, policy_update)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy


@router.delete("/policies/{policy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_policy(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete policy"""
    success = GovernanceService.delete_policy(db, policy_id)
    if not success:
        raise HTTPException(status_code=404, detail="Policy not found")
    return None


# ============================================================================
# Compliance Requirement Endpoints
# ============================================================================

@router.post("/compliance", response_model=ComplianceRequirementResponse, status_code=status.HTTP_201_CREATED)
async def create_compliance_requirement(
    requirement_create: ComplianceRequirementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create compliance requirement"""
    requirement = GovernanceService.create_compliance_requirement(db, requirement_create)
    return requirement


@router.get("/compliance", response_model=List[ComplianceRequirementResponse])
async def get_compliance_requirements(
    regulation: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get compliance requirements with optional filter"""
    requirements = GovernanceService.get_compliance_requirements(db, regulation)
    return requirements


@router.put("/compliance/{requirement_id}", response_model=ComplianceRequirementResponse)
async def update_compliance_requirement(
    requirement_id: int,
    requirement_update: ComplianceRequirementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update compliance requirement"""
    requirement = GovernanceService.update_compliance_requirement(db, requirement_id, requirement_update)
    if not requirement:
        raise HTTPException(status_code=404, detail="Compliance requirement not found")
    return requirement


# ============================================================================
# AI Agent Endpoints - Compliance Agent
# ============================================================================

@router.post("/ai/compliance/check")
async def check_compliance(
    request: ComplianceCheckRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Compliance Agent: Check completeness of governance artifacts.
    IMPORTANT: This agent NEVER auto-approves - it only provides recommendations.
    """
    from app.models.initiative import Initiative
    
    # Get initiative
    initiative = db.query(Initiative).filter(Initiative.id == request.initiative_id).first()
    if not initiative:
        raise HTTPException(status_code=404, detail="Initiative not found")
    
    # Get evidence documents
    evidence_docs = GovernanceService.get_initiative_evidence(db, request.initiative_id)
    
    # Get workflow to determine risk tier
    workflow = GovernanceService.get_workflow_by_initiative(db, request.initiative_id)
    risk_tier = workflow.risk_tier if workflow else "medium"
    
    # Prepare data for AI
    initiative_data = {
        "title": initiative.title,
        "description": initiative.description,
        "ai_type": initiative.ai_type.value if initiative.ai_type else None,
        "strategic_domain": initiative.strategic_domain,
        "data_sources": initiative.data_sources
    }
    
    evidence_list = [
        {
            "type": doc.document_type.value,
            "title": doc.title,
            "status": doc.status,
            "version": doc.version
        }
        for doc in evidence_docs
    ]
    
    # Call AI agent
    result = await openai_service.check_compliance_completeness(
        initiative_data=initiative_data,
        evidence_documents=evidence_list,
        risk_tier=risk_tier
    )
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return json.loads(result["data"])


@router.post("/ai/compliance/map-regulations")
async def map_regulations(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Compliance Agent: Map initiative to applicable regulations.
    """
    from app.models.initiative import Initiative
    
    # Get initiative
    initiative = db.query(Initiative).filter(Initiative.id == initiative_id).first()
    if not initiative:
        raise HTTPException(status_code=404, detail="Initiative not found")
    
    # Prepare data for AI
    initiative_data = {
        "title": initiative.title,
        "description": initiative.description,
        "ai_type": initiative.ai_type.value if initiative.ai_type else None,
        "strategic_domain": initiative.strategic_domain,
        "business_function": initiative.business_function,
        "data_sources": initiative.data_sources
    }
    
    # Call AI agent
    result = await openai_service.map_regulations(initiative_data=initiative_data)
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return json.loads(result["data"])


# ============================================================================
# AI Agent Endpoints - Risk Advisor Agent
# ============================================================================

@router.post("/ai/risk/draft-statement")
async def draft_risk_statement(
    request: RiskAdvisorRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Risk Advisor Agent: Draft clear, actionable risk statements.
    IMPORTANT: This agent NEVER auto-approves - recommendations require human review.
    """
    from app.models.initiative import Initiative
    from app.models.risk import Risk
    
    # Get initiative
    if request.initiative_id:
        initiative = db.query(Initiative).filter(Initiative.id == request.initiative_id).first()
        if not initiative:
            raise HTTPException(status_code=404, detail="Initiative not found")
        
        initiative_data = {
            "title": initiative.title,
            "description": initiative.description,
            "ai_type": initiative.ai_type.value if initiative.ai_type else None
        }
    else:
        initiative_data = {
            "title": "New Initiative",
            "description": request.initiative_description or "",
            "ai_type": request.ai_type
        }
    
    # Prepare risk data (placeholder - would come from request in real scenario)
    risk_data = {
        "category": "ethical",
        "description": "Potential bias in model outcomes",
        "severity": "high"
    }
    
    # Call AI agent
    result = await openai_service.draft_risk_statement(
        risk_data=risk_data,
        initiative_data=initiative_data
    )
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return json.loads(result["data"])


@router.post("/ai/risk/recommend-controls")
async def recommend_risk_controls(
    risk_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Risk Advisor Agent: Recommend mitigation controls for identified risks.
    IMPORTANT: Recommendations require human approval before implementation.
    """
    from app.models.risk import Risk
    from app.models.initiative import Initiative
    
    # Get risk
    risk = db.query(Risk).filter(Risk.id == risk_id).first()
    if not risk:
        raise HTTPException(status_code=404, detail="Risk not found")
    
    # Get initiative
    initiative = db.query(Initiative).filter(Initiative.id == risk.initiative_id).first()
    
    # Prepare data for AI
    risk_data = {
        "title": risk.title,
        "description": risk.description,
        "category": risk.category.value,
        "severity": risk.severity.value,
        "likelihood": risk.likelihood,
        "impact": risk.impact,
        "risk_score": risk.risk_score
    }
    
    initiative_data = {
        "title": initiative.title if initiative else "",
        "ai_type": initiative.ai_type.value if initiative and initiative.ai_type else None,
        "technologies": initiative.technologies if initiative else []
    }
    
    # Call AI agent
    result = await openai_service.recommend_risk_controls(
        risk_data=risk_data,
        initiative_data=initiative_data
    )
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return json.loads(result["data"])


# ============================================================================
# AI Agent Endpoints - Model Card Generator
# ============================================================================

@router.post("/ai/model-card/generate")
async def generate_model_card(
    request: ModelCardGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate a model card template following Google's Model Card framework.
    """
    from app.models.initiative import Initiative
    
    # Get initiative
    initiative = db.query(Initiative).filter(Initiative.id == request.initiative_id).first()
    if not initiative:
        raise HTTPException(status_code=404, detail="Initiative not found")
    
    # Prepare data for AI
    initiative_data = {
        "title": initiative.title,
        "description": initiative.description,
        "ai_type": initiative.ai_type.value if initiative.ai_type else None,
        "business_objective": initiative.business_objective,
        "technologies": initiative.technologies
    }
    
    model_details = {
        "name": request.model_name,
        "type": request.model_type
    } if request.model_name else None
    
    # Call AI agent
    result = await openai_service.generate_model_card(
        initiative_data=initiative_data,
        model_details=model_details
    )
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return json.loads(result["data"])
