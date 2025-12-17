from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Boolean, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class DimensionType(str, enum.Enum):
    VALUE = "value"
    FEASIBILITY = "feasibility"
    RISK = "risk"
    STRATEGIC_ALIGNMENT = "strategic_alignment"


class CriteriaType(str, enum.Enum):
    NUMERIC = "numeric"  # 0-10 scale
    PERCENTAGE = "percentage"  # 0-100%
    BOOLEAN = "boolean"  # Yes/No
    CALCULATED = "calculated"  # Derived from other fields


class ScoringModelVersion(Base):
    """Versioned scoring models for historical tracking and comparison."""
    __tablename__ = "scoring_model_versions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    version = Column(String(50), nullable=False)  # e.g., "v1.0", "v2.0"
    is_active = Column(Boolean, default=False)
    
    # Dimension weights (must sum to 100)
    value_weight = Column(Float, default=40.0)  # 40%
    feasibility_weight = Column(Float, default=35.0)  # 35%
    risk_weight = Column(Float, default=25.0)  # 25%
    strategic_alignment_weight = Column(Float, default=0.0)  # Optional
    
    # Metadata
    created_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    activated_at = Column(DateTime)
    
    # Relationships
    created_by = relationship("User")
    dimensions = relationship("ScoringDimension", back_populates="model_version", cascade="all, delete-orphan")
    initiative_scores = relationship("InitiativeScore", back_populates="model_version")


class ScoringDimension(Base):
    """Configurable scoring dimensions (Value, Feasibility, Risk, etc.)."""
    __tablename__ = "scoring_dimensions"

    id = Column(Integer, primary_key=True, index=True)
    model_version_id = Column(Integer, ForeignKey("scoring_model_versions.id"), nullable=False)
    
    dimension_type = Column(Enum(DimensionType), nullable=False)
    name = Column(String(255), nullable=False)  # Display name
    description = Column(Text)
    weight = Column(Float, nullable=False)  # Weight within the overall model
    
    # Display settings
    color = Column(String(50))  # For UI visualization
    icon = Column(String(50))  # Icon name
    order = Column(Integer, default=0)  # Display order
    
    # Relationships
    model_version = relationship("ScoringModelVersion", back_populates="dimensions")
    criteria = relationship("ScoringCriteria", back_populates="dimension", cascade="all, delete-orphan")


class ScoringCriteria(Base):
    """Individual criteria within each scoring dimension."""
    __tablename__ = "scoring_criteria"

    id = Column(Integer, primary_key=True, index=True)
    dimension_id = Column(Integer, ForeignKey("scoring_dimensions.id"), nullable=False)
    
    name = Column(String(255), nullable=False)
    description = Column(Text)
    criteria_type = Column(Enum(CriteriaType), nullable=False, default=CriteriaType.NUMERIC)
    
    # Weighting within dimension
    weight = Column(Float, nullable=False)  # Weight within the dimension
    
    # Scoring configuration
    min_value = Column(Float, default=0.0)
    max_value = Column(Float, default=10.0)
    is_inverted = Column(Boolean, default=False)  # Higher value = worse (e.g., complexity)
    
    # Calculation
    calculation_formula = Column(Text)  # Optional formula for calculated criteria
    data_source_field = Column(String(100))  # Field name in initiative model
    
    # Display
    order = Column(Integer, default=0)
    help_text = Column(Text)  # Guidance for scoring
    
    # Relationships
    dimension = relationship("ScoringDimension", back_populates="criteria")


class InitiativeScore(Base):
    """Calculated scores for initiatives with historical tracking."""
    __tablename__ = "initiative_scores"

    id = Column(Integer, primary_key=True, index=True)
    initiative_id = Column(Integer, ForeignKey("initiatives.id"), nullable=False)
    model_version_id = Column(Integer, ForeignKey("scoring_model_versions.id"), nullable=False)
    
    # Overall scores
    overall_score = Column(Float, nullable=False)  # Weighted average of all dimensions
    priority_rank = Column(Integer)  # Rank among all initiatives
    
    # Dimension scores (0-10 scale)
    value_score = Column(Float, default=0.0)
    feasibility_score = Column(Float, default=0.0)
    risk_score = Column(Float, default=0.0)
    strategic_alignment_score = Column(Float, default=0.0)
    
    # Detailed breakdown
    criteria_scores = Column(JSON)  # {criteria_id: score}
    
    # AI-generated insights
    score_justification = Column(Text)  # Why this score?
    strengths = Column(JSON)  # List of strengths
    weaknesses = Column(JSON)  # List of weaknesses
    recommendations = Column(JSON)  # List of recommendations
    
    # Confidence and metadata
    confidence_score = Column(Float)  # 0-100, AI confidence in scoring
    calculation_method = Column(String(50))  # "manual", "ai", "hybrid"
    
    # Timestamps
    calculated_at = Column(DateTime, default=datetime.utcnow)
    calculated_by_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    initiative = relationship("Initiative", back_populates="scores")
    model_version = relationship("ScoringModelVersion", back_populates="initiative_scores")
    calculated_by = relationship("User")


class ScenarioSimulation(Base):
    """Portfolio scenario simulations with constraints."""
    __tablename__ = "scenario_simulations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Constraints
    budget_constraint = Column(Float)  # Total budget available
    capacity_constraint = Column(Integer)  # Team capacity (e.g., number of initiatives)
    timeline_constraint = Column(Integer)  # Timeline in months
    
    # Portfolio targets (optional)
    target_portfolio_mix = Column(JSON)  # {"genai": 30, "predictive": 40, ...}
    risk_tolerance = Column(String(50))  # "low", "medium", "high"
    
    # Simulation results
    selected_initiatives = Column(JSON)  # List of initiative IDs
    total_budget_allocated = Column(Float)
    total_expected_roi = Column(Float)
    portfolio_mix = Column(JSON)  # Actual mix after optimization
    risk_distribution = Column(JSON)  # Risk tier distribution
    
    # AI recommendations
    optimization_strategy = Column(Text)  # AI explanation of strategy
    trade_offs = Column(JSON)  # List of trade-offs made
    alternative_scenarios = Column(JSON)  # Alternative recommendations
    
    # Metadata
    created_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    created_by = relationship("User")


class InitiativeComparison(Base):
    """Store initiative comparisons and AI justifications."""
    __tablename__ = "initiative_comparisons"

    id = Column(Integer, primary_key=True, index=True)
    initiative_a_id = Column(Integer, ForeignKey("initiatives.id"), nullable=False)
    initiative_b_id = Column(Integer, ForeignKey("initiatives.id"), nullable=False)
    
    # Comparison results
    winner_id = Column(Integer, ForeignKey("initiatives.id"))  # Which one ranks higher
    score_difference = Column(Float)  # Absolute score difference
    
    # Detailed comparison
    dimension_comparison = Column(JSON)  # Score differences by dimension
    key_differentiators = Column(JSON)  # List of key differences
    
    # AI justification
    justification = Column(Text)  # Why A ranks higher than B (or vice versa)
    recommendation = Column(Text)  # Which to prioritize and why
    
    # Metadata
    compared_at = Column(DateTime, default=datetime.utcnow)
    compared_by_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    initiative_a = relationship("Initiative", foreign_keys=[initiative_a_id])
    initiative_b = relationship("Initiative", foreign_keys=[initiative_b_id])
    winner = relationship("Initiative", foreign_keys=[winner_id])
    compared_by = relationship("User")
