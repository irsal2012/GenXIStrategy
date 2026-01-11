"""
API endpoints for Process Template management and execution.
Handles strategic intake workflow operations.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.process_template import (
    ProcessTemplate,
    ProcessExecution,
    StepExecution,
    StrategyArtifact,
    ExecutionStatus
)
from app.schemas.process_template import (
    ProcessTemplateCreate,
    ProcessTemplateUpdate,
    ProcessTemplate as ProcessTemplateSchema,
    ProcessExecutionCreate,
    ProcessExecutionDetail,
    ExecuteStepRequest,
    ExecuteStepResponse,
    ValidateStepResponse,
    RepairStepResponse,
    ExportExecutionResponse,
    StepExecution as StepExecutionSchema,
    StrategyArtifact as StrategyArtifactSchema
)
from app.services.strategy_process_service import StrategyProcessService

router = APIRouter()


# ========================================================================
# Process Template Management
# ========================================================================

@router.get("/templates", response_model=List[ProcessTemplateSchema])
def list_templates(
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all process templates."""
    query = db.query(ProcessTemplate)
    
    if is_active is not None:
        query = query.filter(ProcessTemplate.is_active == is_active)
    
    templates = query.order_by(ProcessTemplate.is_default.desc(), ProcessTemplate.created_at.desc()).all()
    return templates


@router.get("/templates/{template_id}", response_model=ProcessTemplateSchema)
def get_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific process template."""
    template = db.query(ProcessTemplate).filter(ProcessTemplate.id == template_id).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    return template


@router.post("/templates", response_model=ProcessTemplateSchema, status_code=status.HTTP_201_CREATED)
def create_template(
    template_in: ProcessTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new process template."""
    # Convert steps to dict format for JSON storage
    steps_data = [step.model_dump() for step in template_in.steps]
    
    template = ProcessTemplate(
        name=template_in.name,
        description=template_in.description,
        is_default=template_in.is_default,
        is_active=template_in.is_active,
        steps=steps_data,
        created_by=current_user.id
    )
    
    db.add(template)
    db.commit()
    db.refresh(template)
    
    return template


@router.put("/templates/{template_id}", response_model=ProcessTemplateSchema)
def update_template(
    template_id: int,
    template_in: ProcessTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a process template."""
    template = db.query(ProcessTemplate).filter(ProcessTemplate.id == template_id).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Update fields
    update_data = template_in.model_dump(exclude_unset=True)
    
    # Convert steps if provided
    if "steps" in update_data and update_data["steps"]:
        update_data["steps"] = [step.model_dump() for step in template_in.steps]
    
    for field, value in update_data.items():
        setattr(template, field, value)
    
    template.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(template)
    
    return template


@router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a process template."""
    template = db.query(ProcessTemplate).filter(ProcessTemplate.id == template_id).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Check if template has executions
    execution_count = db.query(ProcessExecution).filter(
        ProcessExecution.template_id == template_id
    ).count()
    
    if execution_count > 0:
        # Soft delete - just deactivate
        template.is_active = False
        db.commit()
    else:
        # Hard delete if no executions
        db.delete(template)
        db.commit()
    
    return None


# ========================================================================
# Process Execution
# ========================================================================

@router.post("/executions", response_model=ProcessExecutionDetail, status_code=status.HTTP_201_CREATED)
async def start_execution(
    execution_in: ProcessExecutionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Start a new process execution."""
    service = StrategyProcessService(db)
    
    try:
        execution = await service.start_process_execution(
            template_id=execution_in.template_id,
            corporate_strategy=execution_in.corporate_strategy_input,
            user_id=current_user.id
        )
        
        # Refresh to load relationships
        db.refresh(execution)
        
        return execution
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start execution: {str(e)}"
        )


@router.get("/executions", response_model=List[ProcessExecutionDetail])
def list_executions(
    status_filter: Optional[ExecutionStatus] = None,
    template_id: Optional[int] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List process executions."""
    query = db.query(ProcessExecution).filter(
        ProcessExecution.created_by == current_user.id
    )
    
    if status_filter:
        query = query.filter(ProcessExecution.status == status_filter)
    
    if template_id:
        query = query.filter(ProcessExecution.template_id == template_id)
    
    executions = query.order_by(ProcessExecution.created_at.desc()).limit(limit).all()
    return executions


@router.get("/executions/{execution_id}", response_model=ProcessExecutionDetail)
def get_execution(
    execution_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific process execution with all details."""
    execution = db.query(ProcessExecution).filter(
        ProcessExecution.id == execution_id
    ).first()
    
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found"
        )
    
    # Check ownership
    if execution.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this execution"
        )
    
    return execution


@router.post("/executions/{execution_id}/steps/{step_order}/execute", response_model=ExecuteStepResponse)
async def execute_step(
    execution_id: int,
    step_order: int,
    request: ExecuteStepRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Execute a specific step in the process."""
    # Verify ownership
    execution = db.query(ProcessExecution).filter(
        ProcessExecution.id == execution_id
    ).first()
    
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found"
        )
    
    if execution.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to execute this process"
        )
    
    service = StrategyProcessService(db)
    
    try:
        result = await service.execute_step(
            execution_id=execution_id,
            step_order=step_order,
            user_provided_input=request.input_data
        )
        
        if result["success"]:
            return ExecuteStepResponse(
                success=True,
                step_execution=result["step_execution"],
                artifacts=result.get("artifacts", [])
            )
        else:
            return ExecuteStepResponse(
                success=False,
                step_execution=result["step_execution"],
                artifacts=[],
                error=result.get("error")
            )
            
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute step: {str(e)}"
        )


@router.post("/executions/{execution_id}/steps/{step_execution_id}/validate", response_model=ValidateStepResponse)
async def validate_step(
    execution_id: int,
    step_execution_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Validate a step's output."""
    # Verify ownership
    execution = db.query(ProcessExecution).filter(
        ProcessExecution.id == execution_id
    ).first()
    
    if not execution or execution.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    step_exec = db.query(StepExecution).filter(
        StepExecution.id == step_execution_id,
        StepExecution.process_execution_id == execution_id
    ).first()
    
    if not step_exec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Step execution not found"
        )
    
    # Return validation results
    is_valid = step_exec.validation_results.get("is_valid", False) if step_exec.validation_results else False
    
    return ValidateStepResponse(
        success=True,
        is_valid=is_valid,
        validation_results=step_exec.validation_results or {},
        validation_errors=step_exec.validation_errors or []
    )


@router.post("/executions/{execution_id}/steps/{step_execution_id}/repair", response_model=RepairStepResponse)
async def repair_step(
    execution_id: int,
    step_execution_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Repair invalid step output using AI."""
    # Verify ownership
    execution = db.query(ProcessExecution).filter(
        ProcessExecution.id == execution_id
    ).first()
    
    if not execution or execution.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    service = StrategyProcessService(db)
    
    try:
        result = await service.repair_step_output(step_execution_id)
        
        return RepairStepResponse(
            success=result["success"],
            repaired_data=result.get("repaired_data"),
            validation_results=result.get("validation_results"),
            error=result.get("error")
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to repair step: {str(e)}"
        )


@router.post("/executions/{execution_id}/create-initiatives")
async def create_initiatives(
    execution_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create Initiative records from the execution results."""
    # Verify ownership
    execution = db.query(ProcessExecution).filter(
        ProcessExecution.id == execution_id
    ).first()
    
    if not execution or execution.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    if execution.status != ExecutionStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Execution must be completed before creating initiatives"
        )
    
    service = StrategyProcessService(db)
    
    try:
        initiatives = await service.create_initiatives_from_execution(
            execution_id=execution_id,
            user_id=current_user.id
        )
        
        return {
            "success": True,
            "initiatives_created": len(initiatives),
            "initiative_ids": [init.id for init in initiatives]
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create initiatives: {str(e)}"
        )


@router.get("/executions/{execution_id}/export", response_model=ExportExecutionResponse)
def export_execution(
    execution_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Export full execution with traceability map."""
    # Verify ownership
    execution = db.query(ProcessExecution).filter(
        ProcessExecution.id == execution_id
    ).first()
    
    if not execution or execution.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    service = StrategyProcessService(db)
    
    try:
        traceability_map = service.build_traceability_map(execution_id)
        
        # Build export response
        steps_data = []
        for step_exec in execution.step_executions:
            steps_data.append({
                "step_name": step_exec.step_name,
                "step_type": step_exec.step_type.value,
                "step_order": step_exec.step_order,
                "status": step_exec.status.value,
                "output_data": step_exec.output_data,
                "validation_status": "valid" if step_exec.validation_results and step_exec.validation_results.get("is_valid") else "invalid"
            })
        
        artifacts_data = []
        for artifact in execution.artifacts:
            artifacts_data.append({
                "artifact_type": artifact.artifact_type.value,
                "artifact_key": artifact.artifact_key,
                "content": artifact.content,
                "initiative_id": artifact.initiative_id
            })
        
        initiatives_data = []
        for init_artifact in traceability_map.get("initiatives", []):
            initiatives_data.append({
                "artifact_id": init_artifact["id"],
                "title": init_artifact["content"].get("title"),
                "initiative_id": init_artifact.get("initiative_id"),
                "traceability_chain": init_artifact.get("full_chain", [])
            })
        
        return ExportExecutionResponse(
            process_execution_id=execution.id,
            template_name=execution.template.name,
            corporate_strategy=execution.corporate_strategy_input,
            execution_date=execution.created_at,
            status=execution.status,
            steps=steps_data,
            artifacts=artifacts_data,
            initiatives=initiatives_data,
            traceability_map=traceability_map
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export execution: {str(e)}"
        )


@router.get("/executions/{execution_id}/traceability")
def get_traceability(
    execution_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get traceability map for an execution."""
    # Verify ownership
    execution = db.query(ProcessExecution).filter(
        ProcessExecution.id == execution_id
    ).first()
    
    if not execution or execution.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    service = StrategyProcessService(db)
    
    try:
        traceability_map = service.build_traceability_map(execution_id)
        return {
            "success": True,
            "traceability": traceability_map
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to build traceability map: {str(e)}"
        )
