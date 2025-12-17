from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class RiskCategory(str, enum.Enum):
    TECHNICAL = "technical"
    ETHICAL = "ethical"
    COMPLIANCE = "compliance"
    BUSINESS = "business"
    OPERATIONAL = "operational"
    REPUTATIONAL = "reputational"


class RiskSeverity(str, enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class RiskStatus(str, enum.Enum):
    IDENTIFIED = "identified"
    ASSESSING = "assessing"
    MITIGATING = "mitigating"
    MONITORING = "monitoring"
    RESOLVED = "resolved"
    ACCEPTED = "accepted"


class Risk(Base):
    __tablename__ = "risks"

    id = Column(Integer, primary_key=True, index=True)
    initiative_id = Column(Integer, ForeignKey("initiatives.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Enum(RiskCategory), nullable=False)
    severity = Column(Enum(RiskSeverity), nullable=False)
    status = Column(Enum(RiskStatus), nullable=False, default=RiskStatus.IDENTIFIED)
    
    # Risk Assessment
    likelihood = Column(Integer, default=0)  # 1-5
    impact = Column(Integer, default=0)  # 1-5
    risk_score = Column(Integer, default=0)  # likelihood * impact
    
    # Mitigation
    mitigation_plan = Column(Text)
    mitigation_owner = Column(String(255))
    mitigation_deadline = Column(DateTime)
    
    # Timestamps
    identified_date = Column(DateTime, default=datetime.utcnow)
    resolved_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    initiative = relationship("Initiative", back_populates="risks")
    mitigations = relationship("RiskMitigation", back_populates="risk", cascade="all, delete-orphan")
