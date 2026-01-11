from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class StepType(str, enum.Enum):
    STRATEGY_ANALYSIS = "strategy_analysis"
    OBJECTIVE_GENERATION = "objective_generation"
    CAPABILITY_MAPPING = "capability_mapping"
    INITIATIVE_GENERATION = "initiative_generation"
    CUSTOM = "custom"


class ExecutionStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    VALIDATING = "validating"
    REPAIRING = "repairing"


class ArtifactType(str, enum.Enum):
    STRATEGY = "strategy"
    OBJECTIVE = "objective"
    CAPABILITY = "capability"
    INITIATIVE = "initiative"
    CUSTOM = "custom"


class ProcessTemplate(Base):
    """
    User-defined workflow templates for strategic intake process.
    Allows configuration of multi-step processes with AI-powered generation.
    """
    __tablename__ = "process_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Steps configuration - array of step definitions
    # Each step: {name, type, order, prompt_template, output_schema, validation_rules}
    steps = Column(JSON, nullable=False)
    
    # Metadata
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    executions = relationship("ProcessExecution", back_populates="template", cascade="all, delete-orphan")


class ProcessExecution(Base):
    """
    Tracks each execution of a process template.
    Stores the corporate strategy input and overall execution state.
    """
    __tablename__ = "process_executions"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("process_templates.id"), nullable=False)
    
    # Input: Corporate strategy statement
    corporate_strategy_input = Column(Text, nullable=False)
    
    # Execution state
    status = Column(Enum(ExecutionStatus), default=ExecutionStatus.PENDING)
    current_step_index = Column(Integer, default=0)
    
    # Metadata
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    template = relationship("ProcessTemplate", back_populates="executions")
    creator = relationship("User", foreign_keys=[created_by])
    step_executions = relationship("StepExecution", back_populates="process_execution", cascade="all, delete-orphan", order_by="StepExecution.step_order")
    artifacts = relationship("StrategyArtifact", back_populates="process_execution", cascade="all, delete-orphan")


class StepExecution(Base):
    """
    Tracks execution of individual steps within a process.
    Stores inputs, outputs, validation results, and traceability.
    """
    __tablename__ = "step_executions"

    id = Column(Integer, primary_key=True, index=True)
    process_execution_id = Column(Integer, ForeignKey("process_executions.id"), nullable=False)
    
    # Step configuration
    step_name = Column(String(255), nullable=False)
    step_type = Column(Enum(StepType), nullable=False)
    step_order = Column(Integer, nullable=False)
    
    # Step data
    input_data = Column(JSON)  # Input to this step (from previous steps or user)
    output_data = Column(JSON)  # Generated output from AI
    prompt_used = Column(Text)  # The actual prompt sent to AI
    
    # Validation
    validation_results = Column(JSON)  # Schema validation, business rules results
    validation_errors = Column(JSON)  # List of validation errors if any
    repair_attempts = Column(Integer, default=0)
    
    # Traceability - maps outputs to source artifacts
    # e.g., {"initiative_1": {"capability": "cap_2", "objective": "obj_1", "strategy_phrase": "..."}}
    traceability_links = Column(JSON)
    
    # Status
    status = Column(Enum(ExecutionStatus), default=ExecutionStatus.PENDING)
    
    # Timestamps
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    process_execution = relationship("ProcessExecution", back_populates="step_executions")
    artifacts = relationship("StrategyArtifact", back_populates="step_execution", cascade="all, delete-orphan")


class StrategyArtifact(Base):
    """
    Stores individual artifacts generated during the process.
    Maintains parent-child relationships for traceability.
    """
    __tablename__ = "strategy_artifacts"

    id = Column(Integer, primary_key=True, index=True)
    process_execution_id = Column(Integer, ForeignKey("process_executions.id"), nullable=False)
    step_execution_id = Column(Integer, ForeignKey("step_executions.id"), nullable=False)
    
    # Artifact details
    artifact_type = Column(Enum(ArtifactType), nullable=False)
    artifact_key = Column(String(100))  # Unique key within the execution (e.g., "obj_1", "cap_2")
    content = Column(JSON, nullable=False)  # The actual artifact data
    
    # Traceability chain
    parent_artifact_id = Column(Integer, ForeignKey("strategy_artifacts.id"), nullable=True)
    
    # If this artifact resulted in an Initiative, link it
    initiative_id = Column(Integer, ForeignKey("initiatives.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    process_execution = relationship("ProcessExecution", back_populates="artifacts")
    step_execution = relationship("StepExecution", back_populates="artifacts")
    parent = relationship("StrategyArtifact", remote_side=[id], backref="children")
    initiative = relationship("Initiative")
