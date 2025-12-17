"""
Roadmap and Dependency Management Models for Module 3
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


class TimelineView(str, enum.Enum):
    """Timeline view types"""
    QUARTERLY = "quarterly"
    NOW_NEXT_LATER = "now_next_later"
    GANTT = "gantt"


class DependencyType(str, enum.Enum):
    """Types of dependencies between initiatives"""
    DATA_PLATFORM = "data_platform"
    SHARED_MODEL = "shared_model"
    VENDOR = "vendor"
    TEAM = "team"
    TECHNICAL = "technical"
    BUSINESS = "business"


class StageGateType(str, enum.Enum):
    """Stage gate progression stages"""
    DISCOVERY = "discovery"
    POC = "poc"
    PILOT = "pilot"
    PRODUCTION = "production"
    MONITORING = "monitoring"


class RoadmapTimeline(Base):
    """Roadmap timeline container for organizing initiatives"""
    __tablename__ = "roadmap_timelines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Timeline configuration
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    view_type = Column(SQLEnum(TimelineView), default=TimelineView.QUARTERLY)
    
    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    initiatives = relationship("Initiative", back_populates="roadmap_timeline")
    creator = relationship("User", foreign_keys=[created_by])


class InitiativeDependency(Base):
    """Track dependencies between initiatives"""
    __tablename__ = "initiative_dependencies"

    id = Column(Integer, primary_key=True, index=True)
    
    # Dependency relationship
    initiative_id = Column(Integer, ForeignKey("initiatives.id"), nullable=False)
    depends_on_id = Column(Integer, ForeignKey("initiatives.id"), nullable=False)
    
    # Dependency details
    dependency_type = Column(SQLEnum(DependencyType), nullable=False)
    description = Column(Text, nullable=True)
    is_blocking = Column(Boolean, default=True)
    
    # Resolution tracking
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    initiative = relationship("Initiative", foreign_keys=[initiative_id], back_populates="dependencies")
    depends_on = relationship("Initiative", foreign_keys=[depends_on_id])
    creator = relationship("User", foreign_keys=[created_by])


class ResourceAllocation(Base):
    """Track team and budget allocation for initiatives"""
    __tablename__ = "resource_allocations"

    id = Column(Integer, primary_key=True, index=True)
    
    # Initiative reference
    initiative_id = Column(Integer, ForeignKey("initiatives.id"), nullable=False)
    
    # Resource details
    resource_type = Column(String(50), nullable=False)  # team, budget, vendor, etc.
    resource_name = Column(String(255), nullable=False)
    
    # Allocation details
    allocated_amount = Column(Float, nullable=False)  # FTE for teams, $ for budget
    allocated_percentage = Column(Float, nullable=True)  # % of total capacity
    
    # Timeline
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    
    # Status
    is_confirmed = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    initiative = relationship("Initiative", back_populates="resource_allocations")
    creator = relationship("User", foreign_keys=[created_by])


class StageGate(Base):
    """Track initiative progression through stage gates"""
    __tablename__ = "stage_gates"

    id = Column(Integer, primary_key=True, index=True)
    
    # Initiative reference
    initiative_id = Column(Integer, ForeignKey("initiatives.id"), nullable=False)
    
    # Stage details
    stage = Column(SQLEnum(StageGateType), nullable=False)
    stage_order = Column(Integer, nullable=False)  # 1-5 for progression tracking
    
    # Status
    is_current = Column(Boolean, default=False)
    is_completed = Column(Boolean, default=False)
    
    # Timeline
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    expected_completion = Column(DateTime, nullable=True)
    
    # Gate criteria
    criteria_checklist = Column(JSON, nullable=True)  # List of criteria items
    approval_required = Column(Boolean, default=True)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    
    # Notes
    notes = Column(Text, nullable=True)
    blockers = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    initiative = relationship("Initiative", back_populates="stage_gates")
    approver = relationship("User", foreign_keys=[approved_by])


class ExternalIntegration(Base):
    """Configuration for external system integrations"""
    __tablename__ = "external_integrations"

    id = Column(Integer, primary_key=True, index=True)
    
    # Integration details
    integration_type = Column(String(50), nullable=False)  # jira, azure_devops, github, gitlab
    integration_name = Column(String(255), nullable=False)
    
    # Configuration
    config = Column(JSON, nullable=False)  # API keys, URLs, project IDs, etc.
    
    # Status
    is_active = Column(Boolean, default=True)
    last_sync_at = Column(DateTime, nullable=True)
    last_sync_status = Column(String(50), nullable=True)  # success, failed, in_progress
    sync_error = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by])


class RoadmapBottleneck(Base):
    """AI-detected bottlenecks in the roadmap"""
    __tablename__ = "roadmap_bottlenecks"

    id = Column(Integer, primary_key=True, index=True)
    
    # Bottleneck details
    bottleneck_type = Column(String(50), nullable=False)  # resource, dependency, timeline, etc.
    severity = Column(String(20), nullable=False)  # low, medium, high, critical
    
    # Description
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    affected_initiatives = Column(JSON, nullable=True)  # List of initiative IDs
    
    # AI recommendations
    ai_recommendation = Column(Text, nullable=True)
    suggested_actions = Column(JSON, nullable=True)  # List of action items
    
    # Status
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    # Metadata
    detected_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
