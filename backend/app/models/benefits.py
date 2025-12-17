from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class KPICategory(str, enum.Enum):
    FINANCIAL = "financial"
    OPERATIONAL = "operational"
    CUSTOMER = "customer"
    EMPLOYEE = "employee"
    STRATEGIC = "strategic"


class MeasurementFrequency(str, enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUALLY = "annually"


class BenefitType(str, enum.Enum):
    COST_REDUCTION = "cost_reduction"
    REVENUE_INCREASE = "revenue_increase"
    EFFICIENCY_GAIN = "efficiency_gain"
    QUALITY_IMPROVEMENT = "quality_improvement"
    RISK_REDUCTION = "risk_reduction"
    STRATEGIC_VALUE = "strategic_value"


class BenefitStatus(str, enum.Enum):
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    REALIZED = "realized"
    AT_RISK = "at_risk"
    NOT_REALIZED = "not_realized"


class LeakageStatus(str, enum.Enum):
    IDENTIFIED = "identified"
    INVESTIGATING = "investigating"
    MITIGATING = "mitigating"
    RESOLVED = "resolved"
    ACCEPTED = "accepted"


class LeakageSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class PIRStatus(str, enum.Enum):
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    PUBLISHED = "published"


class KPIBaseline(Base):
    __tablename__ = "kpi_baselines"

    id = Column(Integer, primary_key=True, index=True)
    initiative_id = Column(Integer, ForeignKey("initiatives.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(Enum(KPICategory), nullable=False)
    baseline_value = Column(Float, nullable=False)
    target_value = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    measurement_frequency = Column(Enum(MeasurementFrequency), nullable=False)
    owner = Column(String(255))
    baseline_date = Column(DateTime, nullable=False)
    target_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    initiative = relationship("Initiative", back_populates="kpi_baselines")
    measurements = relationship("KPIMeasurement", back_populates="kpi_baseline", cascade="all, delete-orphan")


class KPIMeasurement(Base):
    __tablename__ = "kpi_measurements"

    id = Column(Integer, primary_key=True, index=True)
    kpi_baseline_id = Column(Integer, ForeignKey("kpi_baselines.id"), nullable=False)
    measurement_date = Column(DateTime, nullable=False)
    actual_value = Column(Float, nullable=False)
    notes = Column(Text)
    recorded_by = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    kpi_baseline = relationship("KPIBaseline", back_populates="measurements")


class BenefitRealization(Base):
    __tablename__ = "benefit_realizations"

    id = Column(Integer, primary_key=True, index=True)
    initiative_id = Column(Integer, ForeignKey("initiatives.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    benefit_type = Column(Enum(BenefitType), nullable=False)
    status = Column(Enum(BenefitStatus), default=BenefitStatus.PLANNED)
    expected_value = Column(Float, nullable=False)
    realized_value = Column(Float, default=0.0)
    currency = Column(String(10), default="USD")
    expected_realization_date = Column(DateTime, nullable=False)
    actual_realization_date = Column(DateTime)
    owner = Column(String(255))
    dependencies = Column(JSON)  # List of dependency descriptions
    assumptions = Column(JSON)  # List of assumptions
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    initiative = relationship("Initiative", back_populates="benefit_realizations")
    confidence_scores = relationship("BenefitConfidenceScore", back_populates="benefit_realization", cascade="all, delete-orphan")


class BenefitConfidenceScore(Base):
    __tablename__ = "benefit_confidence_scores"

    id = Column(Integer, primary_key=True, index=True)
    benefit_realization_id = Column(Integer, ForeignKey("benefit_realizations.id"), nullable=False)
    score_date = Column(DateTime, nullable=False)
    confidence_level = Column(Float, nullable=False)  # 0-100
    factors = Column(JSON)  # Dict of factors affecting confidence
    notes = Column(Text)
    scored_by = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    benefit_realization = relationship("BenefitRealization", back_populates="confidence_scores")


class ValueLeakage(Base):
    __tablename__ = "value_leakages"

    id = Column(Integer, primary_key=True, index=True)
    initiative_id = Column(Integer, ForeignKey("initiatives.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(Enum(LeakageSeverity), nullable=False)
    status = Column(Enum(LeakageStatus), default=LeakageStatus.IDENTIFIED)
    estimated_impact = Column(Float)  # Financial impact
    currency = Column(String(10), default="USD")
    root_cause = Column(Text)
    mitigation_plan = Column(Text)
    identified_date = Column(DateTime, nullable=False)
    resolved_date = Column(DateTime)
    identified_by = Column(String(255))
    assigned_to = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    initiative = relationship("Initiative", back_populates="value_leakages")


class PostImplementationReview(Base):
    __tablename__ = "post_implementation_reviews"

    id = Column(Integer, primary_key=True, index=True)
    initiative_id = Column(Integer, ForeignKey("initiatives.id"), nullable=False)
    title = Column(String(255), nullable=False)
    status = Column(Enum(PIRStatus), default=PIRStatus.DRAFT)
    review_date = Column(DateTime, nullable=False)
    
    # Executive Summary
    executive_summary = Column(Text)
    
    # Objectives Assessment
    objectives_met = Column(JSON)  # List of objectives and whether they were met
    objectives_analysis = Column(Text)
    
    # Benefits Realization
    benefits_summary = Column(JSON)  # Summary of expected vs actual benefits
    benefits_analysis = Column(Text)
    
    # Lessons Learned
    what_went_well = Column(JSON)  # List of successes
    what_went_wrong = Column(JSON)  # List of challenges
    lessons_learned = Column(JSON)  # List of lessons
    
    # Recommendations
    recommendations = Column(JSON)  # List of recommendations for future initiatives
    
    # Stakeholder Feedback
    stakeholder_feedback = Column(JSON)  # Feedback from key stakeholders
    
    # Metadata
    prepared_by = Column(String(255))
    reviewed_by = Column(String(255))
    approved_by = Column(String(255))
    submitted_date = Column(DateTime)
    approved_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    initiative = relationship("Initiative", back_populates="post_implementation_reviews")
