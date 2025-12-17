from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class InitiativeMetric(Base):
    __tablename__ = "initiative_metrics"

    id = Column(Integer, primary_key=True, index=True)
    initiative_id = Column(Integer, ForeignKey("initiatives.id"), nullable=False)
    metric_name = Column(String(255), nullable=False)
    metric_value = Column(Float, nullable=False)
    metric_unit = Column(String(50))  # e.g., "USD", "hours", "percentage"
    target_value = Column(Float)
    description = Column(Text)
    measurement_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    initiative = relationship("Initiative", back_populates="metrics")


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    initiative_id = Column(Integer, ForeignKey("initiatives.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    target_date = Column(DateTime, nullable=False)
    completion_date = Column(DateTime)
    is_completed = Column(Integer, default=0)  # Using Integer for MySQL compatibility (0 or 1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    initiative = relationship("Initiative", back_populates="milestones")
