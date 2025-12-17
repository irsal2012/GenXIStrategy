"""
Reporting models for Module 6 - CAIO & Board Reporting
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


class DashboardType(str, enum.Enum):
    """Types of executive dashboards"""
    value_pipeline = "value_pipeline"
    delivered_value = "delivered_value"
    risk_exposure = "risk_exposure"
    stage_distribution = "stage_distribution"
    bottlenecks = "bottlenecks"
    portfolio_health = "portfolio_health"


class ReportType(str, enum.Enum):
    """Types of reports that can be generated"""
    board_slides = "board_slides"
    strategy_brief = "strategy_brief"
    quarterly_report = "quarterly_report"
    executive_summary = "executive_summary"


class ReportStatus(str, enum.Enum):
    """Status of report generation"""
    draft = "draft"
    generating = "generating"
    ready = "ready"
    delivered = "delivered"
    archived = "archived"


class MetricType(str, enum.Enum):
    """Types of metrics tracked"""
    financial = "financial"
    operational = "operational"
    strategic = "strategic"
    risk = "risk"
    compliance = "compliance"


class ExportFormat(str, enum.Enum):
    """Export formats for reports"""
    pdf = "pdf"
    pptx = "pptx"
    json = "json"
    excel = "excel"


class ExecutiveDashboard(Base):
    """Executive dashboard configurations and saved views"""
    __tablename__ = "executive_dashboards"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    dashboard_type = Column(SQLEnum(DashboardType), nullable=False)
    description = Column(Text)
    
    # Configuration
    config = Column(JSON)  # Dashboard-specific configuration (filters, date ranges, etc.)
    layout = Column(JSON)  # Layout configuration for widgets
    
    # Ownership
    created_by = Column(Integer, ForeignKey("users.id"))
    is_default = Column(Boolean, default=False)
    is_public = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_viewed_at = Column(DateTime)
    view_count = Column(Integer, default=0)
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by])


class BoardReport(Base):
    """Generated board reports with metadata"""
    __tablename__ = "board_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    report_type = Column(SQLEnum(ReportType), nullable=False)
    status = Column(SQLEnum(ReportStatus), default=ReportStatus.draft)
    
    # Report content
    executive_summary = Column(Text)
    key_metrics = Column(JSON)  # Key metrics included in report
    narrative = Column(Text)  # AI-generated narrative
    recommendations = Column(JSON)  # Strategic recommendations
    
    # Report data
    report_data = Column(JSON)  # Full report data structure
    charts_config = Column(JSON)  # Chart configurations
    
    # Period covered
    period_start = Column(DateTime)
    period_end = Column(DateTime)
    reporting_date = Column(DateTime, default=datetime.utcnow)
    
    # Generation metadata
    generated_by = Column(Integer, ForeignKey("users.id"))
    generated_at = Column(DateTime)
    generation_time_seconds = Column(Float)  # Time taken to generate
    
    # AI metadata
    ai_generated = Column(Boolean, default=False)
    ai_model_used = Column(String(100))
    ai_confidence_score = Column(Float)
    
    # Delivery
    delivered_to = Column(JSON)  # List of recipients
    delivered_at = Column(DateTime)
    
    # Export
    export_format = Column(SQLEnum(ExportFormat))
    file_path = Column(String(500))
    file_size_bytes = Column(Integer)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    generator = relationship("User", foreign_keys=[generated_by])


class StrategyBrief(Base):
    """One-page AI strategy briefs"""
    __tablename__ = "strategy_briefs"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    
    # Brief content
    portfolio_health_score = Column(Float)  # 0-100
    key_metrics = Column(JSON)  # Top metrics (value, ROI, risk)
    top_achievements = Column(JSON)  # Top 3 achievements
    top_risks = Column(JSON)  # Top 3 risks
    strategic_recommendations = Column(JSON)  # Recommendations
    next_quarter_priorities = Column(JSON)  # Next quarter priorities
    
    # AI-generated narrative
    executive_narrative = Column(Text)
    
    # Period
    period_start = Column(DateTime)
    period_end = Column(DateTime)
    
    # Generation
    generated_by = Column(Integer, ForeignKey("users.id"))
    generated_at = Column(DateTime, default=datetime.utcnow)
    ai_generated = Column(Boolean, default=False)
    
    # Export
    file_path = Column(String(500))
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    generator = relationship("User", foreign_keys=[generated_by])


class QuarterlyReport(Base):
    """Quarterly AI impact reports"""
    __tablename__ = "quarterly_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    quarter = Column(String(10))  # e.g., "Q1 2024"
    year = Column(Integer)
    
    # Report sections
    executive_summary = Column(Text)
    portfolio_performance = Column(JSON)
    value_realization = Column(JSON)
    risk_management = Column(JSON)
    governance_compliance = Column(JSON)
    initiative_highlights = Column(JSON)
    lessons_learned = Column(JSON)
    next_quarter_outlook = Column(JSON)
    
    # Metrics
    total_initiatives = Column(Integer)
    total_value_delivered = Column(Float)
    total_budget_spent = Column(Float)
    average_roi = Column(Float)
    risk_score = Column(Float)
    
    # Generation
    generated_by = Column(Integer, ForeignKey("users.id"))
    generated_at = Column(DateTime, default=datetime.utcnow)
    ai_generated = Column(Boolean, default=False)
    
    # Approval
    approved_by = Column(Integer, ForeignKey("users.id"))
    approved_at = Column(DateTime)
    
    # Export
    file_path = Column(String(500))
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    generator = relationship("User", foreign_keys=[generated_by])
    approver = relationship("User", foreign_keys=[approved_by])


class ReportingMetric(Base):
    """Calculated metrics for reporting"""
    __tablename__ = "reporting_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(200), nullable=False)
    metric_type = Column(SQLEnum(MetricType), nullable=False)
    
    # Metric value
    value = Column(Float)
    value_text = Column(String(500))  # For non-numeric metrics
    unit = Column(String(50))  # e.g., "$", "%", "count"
    
    # Context
    initiative_id = Column(Integer, ForeignKey("initiatives.id"), nullable=True)
    portfolio_level = Column(Boolean, default=False)  # True if portfolio-wide metric
    
    # Period
    period_start = Column(DateTime)
    period_end = Column(DateTime)
    calculated_at = Column(DateTime, default=datetime.utcnow)
    
    # Calculation metadata
    calculation_method = Column(String(200))
    data_sources = Column(JSON)  # Sources used for calculation
    
    # Comparison
    previous_value = Column(Float)
    change_percentage = Column(Float)
    trend = Column(String(20))  # "improving", "declining", "stable"
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    initiative = relationship("Initiative", foreign_keys=[initiative_id])


class NarrativeTemplate(Base):
    """Templates for different report narratives"""
    __tablename__ = "narrative_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    report_type = Column(SQLEnum(ReportType), nullable=False)
    
    # Template content
    template_text = Column(Text)  # Template with placeholders
    sections = Column(JSON)  # Structured sections
    
    # Configuration
    required_metrics = Column(JSON)  # Metrics required for this template
    optional_metrics = Column(JSON)  # Optional metrics
    
    # AI prompts
    ai_prompt_template = Column(Text)  # Prompt template for AI generation
    
    # Usage
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    usage_count = Column(Integer, default=0)
    
    # Ownership
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by])


class ReportSchedule(Base):
    """Automated report generation schedules"""
    __tablename__ = "report_schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    report_type = Column(SQLEnum(ReportType), nullable=False)
    
    # Schedule configuration
    frequency = Column(String(50))  # "weekly", "monthly", "quarterly", "annually"
    day_of_week = Column(Integer)  # 0-6 for weekly
    day_of_month = Column(Integer)  # 1-31 for monthly
    month = Column(Integer)  # 1-12 for quarterly/annually
    time_of_day = Column(String(10))  # "09:00"
    
    # Recipients
    recipients = Column(JSON)  # List of email addresses or user IDs
    
    # Configuration
    template_id = Column(Integer, ForeignKey("narrative_templates.id"))
    config = Column(JSON)  # Report-specific configuration
    
    # Status
    is_active = Column(Boolean, default=True)
    last_run_at = Column(DateTime)
    next_run_at = Column(DateTime)
    last_status = Column(String(50))  # "success", "failed", "pending"
    
    # Ownership
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    template = relationship("NarrativeTemplate", foreign_keys=[template_id])
    creator = relationship("User", foreign_keys=[created_by])
