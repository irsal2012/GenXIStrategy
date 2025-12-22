"""
AI Project Management Models - Module 7
Tracks the complete AI project lifecycle from business understanding through deployment and monitoring.
"""
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


class GoNoGoDecision(str, enum.Enum):
    """Go/No-Go decision status"""
    PENDING = "pending"
    GO = "go"
    NO_GO = "no_go"


class DataFeasibilityStatus(str, enum.Enum):
    """Data feasibility assessment status"""
    PENDING = "pending"
    ASSESSING = "assessing"
    FEASIBLE = "feasible"
    NOT_FEASIBLE = "not_feasible"


class PipelineStatus(str, enum.Enum):
    """Data pipeline execution status"""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class ModelStatus(str, enum.Enum):
    """Model development status"""
    NOT_STARTED = "not_started"
    TRAINING = "training"
    COMPLETED = "completed"
    FAILED = "failed"


class DeploymentEnvironment(str, enum.Enum):
    """Deployment environment types"""
    DEV = "dev"
    STAGING = "staging"
    PRODUCTION = "production"


class DeploymentType(str, enum.Enum):
    """Model deployment types"""
    BATCH = "batch"
    REAL_TIME = "real_time"
    EDGE = "edge"


class DeploymentStatus(str, enum.Enum):
    """Deployment status"""
    PENDING = "pending"
    DEPLOYING = "deploying"
    DEPLOYED = "deployed"
    FAILED = "failed"
    RETIRED = "retired"


class MonitoringStatus(str, enum.Enum):
    """Model monitoring health status"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    CRITICAL = "critical"


class BusinessUnderstanding(Base):
    """
    Business Understanding Phase
    Captures business objectives, requirements, and data feasibility assessment
    Enhanced with PMI-CPMAI workflow support
    """
    __tablename__ = "business_understanding"

    id = Column(Integer, primary_key=True, index=True)
    initiative_id = Column(Integer, ForeignKey("initiatives.id"), nullable=False, unique=True)
    
    # PMI-CPMAI: Business Problem Definition
    business_problem_text = Column(Text, nullable=True)  # Original problem description from user
    ai_pattern = Column(String(100), nullable=True)  # One of 7 PMI patterns
    ai_pattern_confidence = Column(Float, nullable=True)  # Confidence score (0-1)
    pattern_override = Column(Boolean, default=False)  # True if user changed AI suggestion
    ai_pattern_reasoning = Column(Text, nullable=True)  # AI's reasoning for pattern selection
    
    # PMI-CPMAI: Initiative Matching
    similar_initiatives_found = Column(JSON, nullable=True)  # List of similar initiative IDs with scores
    ai_recommended_initiative_id = Column(Integer, nullable=True)  # AI's top recommendation
    ai_recommendation_reasoning = Column(Text, nullable=True)  # Why AI recommended this initiative
    user_feedback_no_match = Column(Text, nullable=True)  # User feedback if no good match
    
    # PMI-CPMAI: Tactical Use Case Selection
    selected_use_case = Column(JSON, nullable=True)  # Selected tactical use case: {title, description, expected_outcomes, timeline, success_criteria}
    
    # Business objectives
    business_objectives = Column(Text, nullable=True)
    success_criteria = Column(JSON, nullable=True)  # List of success criteria
    stakeholder_requirements = Column(JSON, nullable=True)  # Stakeholder requirements matrix
    
    # Data feasibility
    data_feasibility_status = Column(SQLEnum(DataFeasibilityStatus), default=DataFeasibilityStatus.PENDING)
    data_sources_identified = Column(JSON, nullable=True)  # List of data sources
    data_access_confirmed = Column(Boolean, default=False)
    compliance_cleared = Column(Boolean, default=False)
    compliance_requirements = Column(JSON, nullable=True)  # List of compliance requirements
    feasibility_notes = Column(Text, nullable=True)
    
    # Go/No-Go decision
    go_no_go_decision = Column(SQLEnum(GoNoGoDecision), default=GoNoGoDecision.PENDING)
    go_no_go_rationale = Column(Text, nullable=True)
    decision_date = Column(DateTime, nullable=True)
    decision_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # AI insights
    ai_feasibility_analysis = Column(JSON, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    initiative = relationship("Initiative", back_populates="business_understanding")
    decision_maker = relationship("User", foreign_keys=[decision_by])
    creator = relationship("User", foreign_keys=[created_by])


class DataUnderstanding(Base):
    """
    Data Understanding Phase
    Tracks dataset exploration, profiling, and quality assessment
    """
    __tablename__ = "data_understanding"

    id = Column(Integer, primary_key=True, index=True)
    initiative_id = Column(Integer, ForeignKey("initiatives.id"), nullable=False)
    
    # Dataset details
    dataset_name = Column(String(255), nullable=False)
    dataset_location = Column(String(500), nullable=True)
    dataset_description = Column(Text, nullable=True)
    
    # Dataset size
    dataset_size_gb = Column(Float, nullable=True)
    record_count = Column(Integer, nullable=True)
    feature_count = Column(Integer, nullable=True)
    
    # Data quality
    data_quality_score = Column(Float, nullable=True)  # 0-100
    missing_values_percentage = Column(Float, nullable=True)
    duplicate_records_percentage = Column(Float, nullable=True)
    
    # Data profiling
    data_profiling_results = Column(JSON, nullable=True)  # Statistical summaries
    data_exploration_notes = Column(Text, nullable=True)
    data_issues_identified = Column(JSON, nullable=True)  # List of issues
    
    # Status
    status = Column(SQLEnum(PipelineStatus), default=PipelineStatus.NOT_STARTED)
    
    # AI insights
    ai_quality_assessment = Column(JSON, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    initiative = relationship("Initiative", back_populates="data_understanding")
    creator = relationship("User", foreign_keys=[created_by])


class DataPreparation(Base):
    """
    Data Preparation Phase
    Tracks data cleaning, transformation, and feature engineering steps
    """
    __tablename__ = "data_preparation"

    id = Column(Integer, primary_key=True, index=True)
    initiative_id = Column(Integer, ForeignKey("initiatives.id"), nullable=False)
    
    # Preparation step details
    step_name = Column(String(255), nullable=False)
    step_type = Column(String(100), nullable=False)  # cleaning, transformation, feature_engineering
    step_description = Column(Text, nullable=True)
    step_order = Column(Integer, nullable=False)  # Execution order
    
    # Data flow
    input_dataset = Column(String(255), nullable=True)
    output_dataset = Column(String(255), nullable=True)
    
    # Code and execution
    code_repository_link = Column(String(500), nullable=True)
    notebook_link = Column(String(500), nullable=True)
    pipeline_config = Column(JSON, nullable=True)
    
    # Execution details
    pipeline_status = Column(SQLEnum(PipelineStatus), default=PipelineStatus.NOT_STARTED)
    execution_start = Column(DateTime, nullable=True)
    execution_end = Column(DateTime, nullable=True)
    execution_time_minutes = Column(Float, nullable=True)
    
    # Quality improvement
    data_quality_before = Column(Float, nullable=True)
    data_quality_after = Column(Float, nullable=True)
    records_processed = Column(Integer, nullable=True)
    records_removed = Column(Integer, nullable=True)
    
    # Logs and errors
    execution_logs = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    initiative = relationship("Initiative", back_populates="data_preparation")
    creator = relationship("User", foreign_keys=[created_by])


class ModelDevelopment(Base):
    """
    Modeling Phase
    Tracks model development, training, and versioning
    """
    __tablename__ = "model_development"

    id = Column(Integer, primary_key=True, index=True)
    initiative_id = Column(Integer, ForeignKey("initiatives.id"), nullable=False)
    
    # Model details
    model_name = Column(String(255), nullable=False)
    model_version = Column(String(50), nullable=False)
    model_description = Column(Text, nullable=True)
    
    # Model type and algorithm
    model_type = Column(String(100), nullable=False)  # classification, regression, clustering, etc.
    algorithm = Column(String(100), nullable=False)  # random_forest, neural_network, etc.
    framework = Column(String(100), nullable=True)  # tensorflow, pytorch, scikit-learn
    
    # Training configuration
    hyperparameters = Column(JSON, nullable=True)
    training_dataset = Column(String(255), nullable=True)
    validation_dataset = Column(String(255), nullable=True)
    training_config = Column(JSON, nullable=True)
    
    # Training execution
    training_start = Column(DateTime, nullable=True)
    training_end = Column(DateTime, nullable=True)
    training_duration_hours = Column(Float, nullable=True)
    
    # Training results
    training_metrics = Column(JSON, nullable=True)  # Loss, accuracy during training
    final_metrics = Column(JSON, nullable=True)  # Final training metrics
    
    # Model artifacts
    model_artifact_location = Column(String(500), nullable=True)
    model_size_mb = Column(Float, nullable=True)
    code_repository_link = Column(String(500), nullable=True)
    
    # Status
    status = Column(SQLEnum(ModelStatus), default=ModelStatus.NOT_STARTED)
    
    # AI insights
    ai_hyperparameter_suggestions = Column(JSON, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    initiative = relationship("Initiative", back_populates="model_development")
    evaluations = relationship("ModelEvaluation", back_populates="model", cascade="all, delete-orphan")
    deployments = relationship("ModelDeployment", back_populates="model", cascade="all, delete-orphan")
    creator = relationship("User", foreign_keys=[created_by])


class ModelEvaluation(Base):
    """
    Evaluation Phase
    Tracks model testing, validation, and performance metrics
    """
    __tablename__ = "model_evaluation"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("model_development.id"), nullable=False)
    
    # Evaluation details
    evaluation_name = Column(String(255), nullable=False)
    evaluation_dataset = Column(String(255), nullable=True)
    evaluation_date = Column(DateTime, default=datetime.utcnow)
    
    # Performance metrics
    evaluation_metrics = Column(JSON, nullable=False)  # accuracy, precision, recall, F1, etc.
    confusion_matrix = Column(JSON, nullable=True)
    roc_curve_data = Column(JSON, nullable=True)
    feature_importance = Column(JSON, nullable=True)
    
    # Threshold and validation
    performance_threshold = Column(Float, nullable=True)
    passed_threshold = Column(Boolean, default=False)
    
    # Evaluation notes
    evaluator_notes = Column(Text, nullable=True)
    strengths = Column(Text, nullable=True)
    weaknesses = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    
    # Approval
    approved_for_deployment = Column(Boolean, default=False)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    
    # AI insights
    ai_interpretation = Column(JSON, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    model = relationship("ModelDevelopment", back_populates="evaluations")
    approver = relationship("User", foreign_keys=[approved_by])
    creator = relationship("User", foreign_keys=[created_by])


class ModelDeployment(Base):
    """
    Deployment Phase
    Tracks model deployment to various environments
    """
    __tablename__ = "model_deployment"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("model_development.id"), nullable=False)
    
    # Deployment details
    deployment_name = Column(String(255), nullable=False)
    deployment_environment = Column(SQLEnum(DeploymentEnvironment), nullable=False)
    deployment_type = Column(SQLEnum(DeploymentType), nullable=False)
    
    # Deployment configuration
    endpoint_url = Column(String(500), nullable=True)
    api_key = Column(String(255), nullable=True)
    deployment_config = Column(JSON, nullable=True)
    infrastructure_details = Column(JSON, nullable=True)
    
    # Deployment execution
    deployment_date = Column(DateTime, nullable=True)
    deployment_status = Column(SQLEnum(DeploymentStatus), default=DeploymentStatus.PENDING)
    
    # Monitoring
    monitoring_enabled = Column(Boolean, default=True)
    alerting_enabled = Column(Boolean, default=True)
    alert_thresholds = Column(JSON, nullable=True)
    
    # Rollback
    rollback_plan = Column(Text, nullable=True)
    previous_deployment_id = Column(Integer, ForeignKey("model_deployment.id"), nullable=True)
    
    # Deployment logs
    deployment_logs = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deployed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    model = relationship("ModelDevelopment", back_populates="deployments")
    monitoring_records = relationship("ModelMonitoring", back_populates="deployment", cascade="all, delete-orphan")
    previous_deployment = relationship("ModelDeployment", remote_side=[id])
    deployer = relationship("User", foreign_keys=[deployed_by])


class ModelMonitoring(Base):
    """
    Monitoring Phase
    Tracks model performance, drift, and operational metrics in production
    """
    __tablename__ = "model_monitoring"

    id = Column(Integer, primary_key=True, index=True)
    deployment_id = Column(Integer, ForeignKey("model_deployment.id"), nullable=False)
    
    # Monitoring timestamp
    monitoring_date = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Operational metrics
    inference_count = Column(Integer, default=0)
    average_latency_ms = Column(Float, nullable=True)
    error_rate = Column(Float, nullable=True)  # Percentage
    throughput = Column(Float, nullable=True)  # Requests per second
    
    # Performance metrics
    performance_metrics = Column(JSON, nullable=True)  # Current model performance
    
    # Drift detection
    data_drift_score = Column(Float, nullable=True)  # 0-100
    model_drift_score = Column(Float, nullable=True)  # 0-100
    drift_details = Column(JSON, nullable=True)
    
    # Alerts
    alerts_triggered = Column(JSON, nullable=True)  # List of alerts
    alert_count = Column(Integer, default=0)
    
    # Health status
    status = Column(SQLEnum(MonitoringStatus), default=MonitoringStatus.HEALTHY)
    health_score = Column(Float, nullable=True)  # 0-100
    
    # AI insights
    ai_drift_analysis = Column(JSON, nullable=True)
    ai_recommendations = Column(JSON, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    deployment = relationship("ModelDeployment", back_populates="monitoring_records")
