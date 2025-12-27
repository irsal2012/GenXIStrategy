from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.initiative import InitiativePriority, AIType


class InitiativeBase(BaseModel):
    title: str
    description: str
    business_objective: Optional[str] = None
    priority: InitiativePriority = InitiativePriority.MEDIUM
    
    # Module 1: Taxonomy fields
    ai_type: Optional[AIType] = None
    strategic_domain: Optional[str] = None
    business_function: Optional[str] = None
    data_sources: Optional[List[str]] = None
    
    budget_allocated: float = 0.0
    budget_spent: float = 0.0
    expected_roi: Optional[float] = None
    actual_roi: Optional[float] = None
    business_value_score: int = 0
    technical_feasibility_score: int = 0
    risk_score: int = 0
    strategic_alignment_score: int = 0
    team_members: Optional[List[int]] = None
    stakeholders: Optional[List[str]] = None
    technologies: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    start_date: Optional[datetime] = None
    target_completion_date: Optional[datetime] = None


class InitiativeCreate(InitiativeBase):
    pass


class InitiativeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    business_objective: Optional[str] = None
    priority: Optional[InitiativePriority] = None
    
    # Module 1: Taxonomy fields
    ai_type: Optional[AIType] = None
    strategic_domain: Optional[str] = None
    business_function: Optional[str] = None
    data_sources: Optional[List[str]] = None
    
    budget_allocated: Optional[float] = None
    budget_spent: Optional[float] = None
    expected_roi: Optional[float] = None
    actual_roi: Optional[float] = None
    business_value_score: Optional[int] = None
    technical_feasibility_score: Optional[int] = None
    risk_score: Optional[int] = None
    strategic_alignment_score: Optional[int] = None
    team_members: Optional[List[int]] = None
    stakeholders: Optional[List[str]] = None
    technologies: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    start_date: Optional[datetime] = None
    target_completion_date: Optional[datetime] = None
    actual_completion_date: Optional[datetime] = None


class InitiativeInDB(InitiativeBase):
    id: int
    owner_id: int
    actual_completion_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Initiative(InitiativeInDB):
    pass


class InitiativeWithDetails(Initiative):
    """Initiative with related data like metrics, risks, etc."""
    metrics_count: int = 0
    risks_count: int = 0
    milestones_count: int = 0
    comments_count: int = 0
