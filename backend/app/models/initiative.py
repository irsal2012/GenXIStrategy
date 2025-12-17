from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class InitiativeStatus(str, enum.Enum):
    IDEATION = "ideation"
    PLANNING = "planning"
    PILOT = "pilot"
    PRODUCTION = "production"
    RETIRED = "retired"
    ON_HOLD = "on_hold"


class InitiativePriority(str, enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class AIType(str, enum.Enum):
    GENAI = "genai"
    PREDICTIVE = "predictive"
    OPTIMIZATION = "optimization"
    AUTOMATION = "automation"


class Initiative(Base):
    __tablename__ = "initiatives"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    business_objective = Column(Text)
    status = Column(Enum(InitiativeStatus), nullable=False, default=InitiativeStatus.IDEATION)
    priority = Column(Enum(InitiativePriority), nullable=False, default=InitiativePriority.MEDIUM)
    
    # Module 1: Taxonomy fields
    ai_type = Column(Enum(AIType))
    strategic_domain = Column(String(100))  # e.g., "Customer Experience", "Operations"
    business_function = Column(String(100))  # e.g., "Marketing", "Finance", "HR"
    data_sources = Column(JSON)  # List of data sources required
    
    # Financial
    budget_allocated = Column(Float, default=0.0)
    budget_spent = Column(Float, default=0.0)
    expected_roi = Column(Float)
    actual_roi = Column(Float)
    
    # Scoring
    business_value_score = Column(Integer, default=0)  # 0-10
    technical_feasibility_score = Column(Integer, default=0)  # 0-10
    risk_score = Column(Integer, default=0)  # 0-10
    strategic_alignment_score = Column(Integer, default=0)  # 0-10
    
    # Metadata
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    team_members = Column(JSON)  # List of user IDs
    stakeholders = Column(JSON)  # List of stakeholder names/emails
    technologies = Column(JSON)  # List of technologies used
    tags = Column(JSON)  # List of tags
    
    # Timestamps
    start_date = Column(DateTime)
    target_completion_date = Column(DateTime)
    actual_completion_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="initiatives")
    metrics = relationship("InitiativeMetric", back_populates="initiative", cascade="all, delete-orphan")
    risks = relationship("Risk", back_populates="initiative", cascade="all, delete-orphan")
    milestones = relationship("Milestone", back_populates="initiative", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="initiative", cascade="all, delete-orphan")
    attachments = relationship("Attachment", back_populates="initiative", cascade="all, delete-orphan")
    scores = relationship("InitiativeScore", back_populates="initiative", cascade="all, delete-orphan")
