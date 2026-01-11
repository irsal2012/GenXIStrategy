"""
Strategy Process Service - Handles execution of strategic intake workflows.

This service orchestrates the multi-step process for transforming corporate strategy
into actionable AI initiatives with full traceability.
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import json
import jsonschema
from jsonschema import validate, ValidationError

from app.models.process_template import (
    ProcessTemplate,
    ProcessExecution,
    StepExecution,
    StrategyArtifact,
    StepType,
    ExecutionStatus,
    ArtifactType
)
from app.models.initiative import Initiative, AIType as InitiativeAIType, InitiativePriority
from app.models.user import User
from app.services.openai_service import openai_service

import logging

logger = logging.getLogger(__name__)


class StrategyProcessService:
    """Service for executing strategic intake processes."""
    
    def __init__(self, db: Session):
        self.db = db
    
    # ========================================================================
    # Process Execution Methods
    # ========================================================================
    
    async def start_process_execution(
        self,
        template_id: int,
        corporate_strategy: str,
        user_id: int
    ) -> ProcessExecution:
        """
        Start a new process execution.
        Creates the process execution record and initializes step executions.
        """
        # Get template
        template = self.db.query(ProcessTemplate).filter(
            ProcessTemplate.id == template_id,
            ProcessTemplate.is_active == True
        ).first()
        
        if not template:
            raise ValueError(f"Template {template_id} not found or inactive")
        
        # Create process execution
        execution = ProcessExecution(
            template_id=template_id,
            corporate_strategy_input=corporate_strategy,
            status=ExecutionStatus.PENDING,
            current_step_index=0,
            created_by=user_id
        )
        
        self.db.add(execution)
        self.db.flush()
        
        # Create step execution records for all steps
        for step_config in template.steps:
            step_exec = StepExecution(
                process_execution_id=execution.id,
                step_name=step_config["name"],
                step_type=StepType(step_config["type"]),
                step_order=step_config["order"],
                status=ExecutionStatus.PENDING
            )
            self.db.add(step_exec)
        
        self.db.commit()
        self.db.refresh(execution)
        
        logger.info(f"Started process execution {execution.id} for template {template_id}")
        return execution
    
    async def execute_step(
        self,
        execution_id: int,
        step_order: int,
        user_provided_input: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Execute a specific step in the process.
        Returns the step execution with generated output and artifacts.
        """
        # Get execution and step
        execution = self.db.query(ProcessExecution).filter(
            ProcessExecution.id == execution_id
        ).first()
        
        if not execution:
            raise ValueError(f"Process execution {execution_id} not found")
        
        step_exec = self.db.query(StepExecution).filter(
            StepExecution.process_execution_id == execution_id,
            StepExecution.step_order == step_order
        ).first()
        
        if not step_exec:
            raise ValueError(f"Step {step_order} not found in execution {execution_id}")
        
        # Update step status
        step_exec.status = ExecutionStatus.IN_PROGRESS
        step_exec.started_at = datetime.utcnow()
        self.db.commit()
        
        try:
            # Get template step configuration
            template = execution.template
            step_config = next(
                (s for s in template.steps if s["order"] == step_order),
                None
            )
            
            if not step_config:
                raise ValueError(f"Step configuration not found for order {step_order}")
            
            # Prepare input data
            input_data = await self._prepare_step_input(
                execution,
                step_exec,
                step_config,
                user_provided_input
            )
            
            step_exec.input_data = input_data
            
            # Build prompt
            prompt = self._build_prompt(
                step_config["prompt_template"],
                execution.corporate_strategy_input,
                input_data
            )
            
            step_exec.prompt_used = prompt
            self.db.commit()
            
            # Execute with AI
            output_data = await self._execute_with_ai(prompt, step_config)
            
            step_exec.output_data = output_data
            
            # Create artifacts
            artifacts = await self._create_artifacts(
                execution,
                step_exec,
                output_data,
                step_config
            )
            
            # Validate output
            validation_result = await self._validate_step_output(
                output_data,
                step_config.get("output_schema"),
                step_config.get("validation_rules")
            )
            
            step_exec.validation_results = validation_result
            
            if validation_result["is_valid"]:
                step_exec.status = ExecutionStatus.COMPLETED
            else:
                step_exec.status = ExecutionStatus.VALIDATING
                step_exec.validation_errors = validation_result.get("errors", [])
            
            step_exec.completed_at = datetime.utcnow()
            
            # Update execution progress
            execution.current_step_index = step_order
            if step_order == len(template.steps):
                execution.status = ExecutionStatus.COMPLETED
                execution.completed_at = datetime.utcnow()
            else:
                execution.status = ExecutionStatus.IN_PROGRESS
            
            self.db.commit()
            self.db.refresh(step_exec)
            
            return {
                "success": True,
                "step_execution": step_exec,
                "artifacts": artifacts,
                "validation": validation_result
            }
            
        except Exception as e:
            logger.error(f"Error executing step {step_order}: {str(e)}")
            step_exec.status = ExecutionStatus.FAILED
            step_exec.validation_errors = [{"error": str(e)}]
            self.db.commit()
            
            return {
                "success": False,
                "error": str(e),
                "step_execution": step_exec
            }
    
    async def _prepare_step_input(
        self,
        execution: ProcessExecution,
        step_exec: StepExecution,
        step_config: Dict[str, Any],
        user_input: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Prepare input data for a step from previous steps and user input."""
        input_data = {}
        
        # Add corporate strategy
        input_data["corporate_strategy"] = execution.corporate_strategy_input
        
        # Add outputs from previous steps
        previous_steps = self.db.query(StepExecution).filter(
            StepExecution.process_execution_id == execution.id,
            StepExecution.step_order < step_exec.step_order,
            StepExecution.status == ExecutionStatus.COMPLETED
        ).order_by(StepExecution.step_order).all()
        
        for prev_step in previous_steps:
            if prev_step.output_data:
                # Store with step name as key
                key = prev_step.step_name.lower().replace(" ", "_")
                input_data[key] = prev_step.output_data
                
                # Also store as "previous_output" for the immediately preceding step
                if prev_step.step_order == step_exec.step_order - 1:
                    input_data["previous_output"] = json.dumps(prev_step.output_data, indent=2)
        
        # Add user-provided input
        if user_input:
            input_data.update(user_input)
        
        return input_data
    
    def _build_prompt(
        self,
        template: str,
        corporate_strategy: str,
        input_data: Dict[str, Any]
    ) -> str:
        """Build the prompt by replacing placeholders in the template."""
        prompt = template
        
        # Replace corporate_strategy placeholder
        prompt = prompt.replace("{corporate_strategy}", corporate_strategy)
        
        # Replace other placeholders
        for key, value in input_data.items():
            placeholder = f"{{{key}}}"
            if placeholder in prompt:
                if isinstance(value, (dict, list)):
                    prompt = prompt.replace(placeholder, json.dumps(value, indent=2))
                else:
                    prompt = prompt.replace(placeholder, str(value))
        
        return prompt
    
    async def _execute_with_ai(
        self,
        prompt: str,
        step_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute the prompt with OpenAI and return structured output."""
        try:
            # Use synchronous call - OpenAI Python client doesn't support async in this context
            response = openai_service.client.chat.completions.create(
                model=openai_service.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a strategic AI consultant helping to transform corporate strategy into actionable AI initiatives. Always return valid JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
            
        except Exception as e:
            logger.error(f"AI execution error: {str(e)}")
            raise
    
    async def _create_artifacts(
        self,
        execution: ProcessExecution,
        step_exec: StepExecution,
        output_data: Dict[str, Any],
        step_config: Dict[str, Any]
    ) -> List[StrategyArtifact]:
        """Create artifact records from step output."""
        artifacts = []
        
        # Determine artifact type based on step type
        artifact_type_map = {
            StepType.STRATEGY_ANALYSIS: ArtifactType.STRATEGY,
            StepType.OBJECTIVE_GENERATION: ArtifactType.OBJECTIVE,
            StepType.CAPABILITY_MAPPING: ArtifactType.CAPABILITY,
            StepType.INITIATIVE_GENERATION: ArtifactType.INITIATIVE,
            StepType.CUSTOM: ArtifactType.CUSTOM
        }
        
        artifact_type = artifact_type_map.get(step_exec.step_type, ArtifactType.CUSTOM)
        
        # Extract individual artifacts based on output structure
        # New Flow: Strategic Orientation (themes) → Capability Needs → AI Initiatives → KPIs
        if step_exec.step_type == StepType.STRATEGY_ANALYSIS:
            # Step 1: Strategic Orientation - Create artifacts for themes
            for theme in output_data.get("themes", []):
                artifact = StrategyArtifact(
                    process_execution_id=execution.id,
                    step_execution_id=step_exec.id,
                    artifact_type=ArtifactType.STRATEGY,
                    artifact_key=theme.get("id"),
                    content=theme
                )
                self.db.add(artifact)
                artifacts.append(artifact)
        
        elif step_exec.step_type == StepType.CAPABILITY_MAPPING:
            # Step 2: Strategic Capability Needs - Create artifacts for capabilities
            for capability in output_data.get("capabilities", []):
                # Find parent theme artifacts
                theme_ids = capability.get("theme_ids", [])
                # Link to first theme for simplicity (could create multiple links)
                parent = None
                if theme_ids:
                    parent = self.db.query(StrategyArtifact).filter(
                        StrategyArtifact.process_execution_id == execution.id,
                        StrategyArtifact.artifact_key == theme_ids[0]
                    ).first()
                
                artifact = StrategyArtifact(
                    process_execution_id=execution.id,
                    step_execution_id=step_exec.id,
                    artifact_type=ArtifactType.CAPABILITY,
                    artifact_key=capability.get("id"),
                    content=capability,
                    parent_artifact_id=parent.id if parent else None
                )
                self.db.add(artifact)
                artifacts.append(artifact)
        
        elif step_exec.step_type == StepType.INITIATIVE_GENERATION:
            # Step 3: Strategic AI Initiative - Create artifacts for initiatives
            for initiative in output_data.get("initiatives", []):
                # Find parent capability artifact
                capability_id = initiative.get("capability_id")
                parent = self.db.query(StrategyArtifact).filter(
                    StrategyArtifact.process_execution_id == execution.id,
                    StrategyArtifact.artifact_key == capability_id
                ).first()
                
                artifact = StrategyArtifact(
                    process_execution_id=execution.id,
                    step_execution_id=step_exec.id,
                    artifact_type=ArtifactType.INITIATIVE,
                    artifact_key=initiative.get("id"),
                    content=initiative,
                    parent_artifact_id=parent.id if parent else None
                )
                self.db.add(artifact)
                artifacts.append(artifact)
        
        elif step_exec.step_type == StepType.OBJECTIVE_GENERATION:
            # Step 4: Business Objectives (KPIs) - Create artifacts for KPIs
            for kpi in output_data.get("kpis", []):
                # Find parent initiative artifact
                initiative_id = kpi.get("initiative_id")
                parent = self.db.query(StrategyArtifact).filter(
                    StrategyArtifact.process_execution_id == execution.id,
                    StrategyArtifact.artifact_key == initiative_id
                ).first()
                
                artifact = StrategyArtifact(
                    process_execution_id=execution.id,
                    step_execution_id=step_exec.id,
                    artifact_type=ArtifactType.OBJECTIVE,
                    artifact_key=kpi.get("id"),
                    content=kpi,
                    parent_artifact_id=parent.id if parent else None
                )
                self.db.add(artifact)
                artifacts.append(artifact)
        
        self.db.commit()
        return artifacts
    
    async def _validate_step_output(
        self,
        output_data: Dict[str, Any],
        schema: Optional[Dict[str, Any]],
        validation_rules: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Validate step output against JSON schema and business rules."""
        errors = []
        
        # JSON Schema validation
        if schema:
            try:
                validate(instance=output_data, schema=schema)
            except ValidationError as e:
                errors.append({
                    "type": "schema",
                    "message": e.message,
                    "path": list(e.path)
                })
        
        # Business rules validation
        if validation_rules:
            # Add custom business rule validation here
            pass
        
        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
            "validated_at": datetime.utcnow().isoformat()
        }
    
    async def repair_step_output(
        self,
        step_execution_id: int
    ) -> Dict[str, Any]:
        """Use AI to repair invalid step output."""
        step_exec = self.db.query(StepExecution).filter(
            StepExecution.id == step_execution_id
        ).first()
        
        if not step_exec:
            raise ValueError(f"Step execution {step_execution_id} not found")
        
        if not step_exec.validation_errors:
            return {
                "success": True,
                "message": "No validation errors to repair"
            }
        
        step_exec.status = ExecutionStatus.REPAIRING
        step_exec.repair_attempts += 1
        self.db.commit()
        
        try:
            # Build repair prompt
            repair_prompt = f"""The following JSON output has validation errors. Please fix them and return valid JSON.

Original Output:
{json.dumps(step_exec.output_data, indent=2)}

Validation Errors:
{json.dumps(step_exec.validation_errors, indent=2)}

Required Schema:
{json.dumps(step_exec.input_data.get("output_schema", {}), indent=2)}

Return the corrected JSON that passes validation."""
            
            # Execute repair with AI
            execution = step_exec.process_execution
            template = execution.template
            step_config = next(
                (s for s in template.steps if s["order"] == step_exec.step_order),
                None
            )
            
            repaired_data = await self._execute_with_ai(repair_prompt, step_config or {})
            
            # Validate repaired data
            validation_result = await self._validate_step_output(
                repaired_data,
                step_config.get("output_schema") if step_config else None,
                step_config.get("validation_rules") if step_config else None
            )
            
            if validation_result["is_valid"]:
                step_exec.output_data = repaired_data
                step_exec.validation_results = validation_result
                step_exec.validation_errors = []
                step_exec.status = ExecutionStatus.COMPLETED
                self.db.commit()
                
                return {
                    "success": True,
                    "repaired_data": repaired_data,
                    "validation_results": validation_result
                }
            else:
                step_exec.validation_errors = validation_result.get("errors", [])
                step_exec.status = ExecutionStatus.VALIDATING
                self.db.commit()
                
                return {
                    "success": False,
                    "error": "Repaired data still has validation errors",
                    "validation_errors": validation_result.get("errors", [])
                }
                
        except Exception as e:
            logger.error(f"Error repairing step output: {str(e)}")
            step_exec.status = ExecutionStatus.FAILED
            self.db.commit()
            
            return {
                "success": False,
                "error": str(e)
            }
    
    async def create_initiatives_from_execution(
        self,
        execution_id: int,
        user_id: int
    ) -> List[Initiative]:
        """
        Create Initiative records from the final step of a process execution.
        Links initiatives to their artifacts for traceability.
        """
        execution = self.db.query(ProcessExecution).filter(
            ProcessExecution.id == execution_id
        ).first()
        
        if not execution:
            raise ValueError(f"Process execution {execution_id} not found")
        
        # Get initiative artifacts
        initiative_artifacts = self.db.query(StrategyArtifact).filter(
            StrategyArtifact.process_execution_id == execution_id,
            StrategyArtifact.artifact_type == ArtifactType.INITIATIVE
        ).all()
        
        created_initiatives = []
        
        for artifact in initiative_artifacts:
            content = artifact.content
            
            # Map AI type
            ai_type_map = {
                "genai": InitiativeAIType.GENAI,
                "predictive": InitiativeAIType.PREDICTIVE,
                "optimization": InitiativeAIType.OPTIMIZATION,
                "automation": InitiativeAIType.AUTOMATION
            }
            
            # Create initiative
            initiative = Initiative(
                title=content.get("title"),
                description=content.get("description"),
                business_objective=content.get("business_objective"),
                ai_type=ai_type_map.get(content.get("ai_type")),
                technologies=content.get("technologies", []),
                data_sources=content.get("data_sources", []),
                expected_roi=content.get("expected_roi"),
                budget_allocated=content.get("budget_estimate", 0),
                business_value_score=8,  # Default high business value from strategic process
                technical_feasibility_score=7,  # Default reasonable feasibility
                strategic_alignment_score=9,  # High alignment since derived from strategy
                risk_score=5,  # Medium risk by default
                priority=InitiativePriority.MEDIUM,
                owner_id=user_id
            )
            
            self.db.add(initiative)
            self.db.flush()
            
            # Link artifact to initiative
            artifact.initiative_id = initiative.id
            
            created_initiatives.append(initiative)
        
        self.db.commit()
        
        logger.info(f"Created {len(created_initiatives)} initiatives from execution {execution_id}")
        return created_initiatives
    
    def build_traceability_map(self, execution_id: int) -> Dict[str, Any]:
        """Build a complete traceability map for an execution."""
        execution = self.db.query(ProcessExecution).filter(
            ProcessExecution.id == execution_id
        ).first()
        
        if not execution:
            raise ValueError(f"Process execution {execution_id} not found")
        
        # Get all artifacts
        artifacts = self.db.query(StrategyArtifact).filter(
            StrategyArtifact.process_execution_id == execution_id
        ).all()
        
        # Build hierarchy
        traceability = {
            "execution_id": execution_id,
            "corporate_strategy": execution.corporate_strategy_input,
            "themes": [],
            "objectives": [],
            "capabilities": [],
            "initiatives": []
        }
        
        # Organize by type
        for artifact in artifacts:
            if artifact.artifact_type == ArtifactType.STRATEGY:
                traceability["themes"].append({
                    "id": artifact.artifact_key,
                    "content": artifact.content
                })
            elif artifact.artifact_type == ArtifactType.OBJECTIVE:
                traceability["objectives"].append({
                    "id": artifact.artifact_key,
                    "content": artifact.content,
                    "parent_theme": self._get_parent_key(artifact)
                })
            elif artifact.artifact_type == ArtifactType.CAPABILITY:
                traceability["capabilities"].append({
                    "id": artifact.artifact_key,
                    "content": artifact.content,
                    "parent_objective": self._get_parent_key(artifact)
                })
            elif artifact.artifact_type == ArtifactType.INITIATIVE:
                traceability["initiatives"].append({
                    "id": artifact.artifact_key,
                    "content": artifact.content,
                    "parent_capability": self._get_parent_key(artifact),
                    "initiative_id": artifact.initiative_id,
                    "full_chain": self._build_chain(artifact)
                })
        
        return traceability
    
    def _get_parent_key(self, artifact: StrategyArtifact) -> Optional[str]:
        """Get the artifact key of the parent artifact."""
        if artifact.parent_artifact_id:
            parent = self.db.query(StrategyArtifact).filter(
                StrategyArtifact.id == artifact.parent_artifact_id
            ).first()
            return parent.artifact_key if parent else None
        return None
    
    def _build_chain(self, artifact: StrategyArtifact) -> List[str]:
        """Build the full traceability chain for an artifact."""
        chain = [artifact.artifact_key]
        current = artifact
        
        while current.parent_artifact_id:
            parent = self.db.query(StrategyArtifact).filter(
                StrategyArtifact.id == current.parent_artifact_id
            ).first()
            if parent:
                chain.insert(0, parent.artifact_key)
                current = parent
            else:
                break
        
        return chain
