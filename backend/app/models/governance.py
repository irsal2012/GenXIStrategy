from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, JSON
from datetime import datetime
import enum
from app.core.database import Base


class ComplianceStatus(str, enum.Enum):
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    IN_PROGRESS = "in_progress"
    NOT_APPLICABLE = "not_applicable"


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
