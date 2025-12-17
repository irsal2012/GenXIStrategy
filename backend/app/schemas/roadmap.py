"""
Roadmap and Dependency Management Schemas for Module 3
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# Enums
class TimelineViewEnum(str, Enum):
    QUARTERLY = "quarterly"
    NOW_NEXT_LATER = "now_next_later"
    GANTT = "gantt"


class DependencyTypeEnum(str, Enum):
    DATA_PLATFORM = "data_platform"
    SHARED_MODEL = "shared_model"
    VENDOR = "vendor"
    TEAM = "team"
    TECHNICAL = "technical"
    BUSINESS = "business"


class StageGateTypeEnum(str, Enum):
    DISCOVERY = "discovery"
    POC = "poc"
    PILOT = "pilot"
    PRODUCTION = "production"
    MONITORING = "monitoring"


# Roadmap Timeline Schemas
class RoadmapTimelineBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    view_type: TimelineViewEnum = TimelineViewEnum.QUARTERLY
    is_active: bool = True


class RoadmapTimelineCreate(RoadmapTimelineBase):
    pass


class RoadmapTimelineUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    view_type: Optional[TimelineViewEnum] = None
    is_active: Optional[bool] = None


class RoadmapTimelineResponse(RoadmapTimelineBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None
    initiative_count: Optional[int] = 0

    class Config:
        from_attributes = True


# Initiative Dependency Schemas
class InitiativeDependencyBase(BaseModel):
    initiative_id: int
    depends_on_id: int
    dependency_type: DependencyTypeEnum
    description: Optional[str] = None
    is_blocking: bool = True


class InitiativeDependencyCreate(InitiativeDependencyBase):
    pass


class InitiativeDependencyUpdate(BaseModel):
    dependency_type: Optional[DependencyTypeEnum] = None
    description: Optional[str] = None
    is_blocking: Optional[bool] = None
    is_resolved: Optional[bool] = None
    resolution_notes: Optional[str] = None


class InitiativeDependencyResponse(InitiativeDependencyBase):
    id: int
    is_resolved: bool
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None

    class Config:
        from_attributes = True


# Resource Allocation Schemas
class ResourceAllocationBase(BaseModel):
    initiative_id: int
    resource_type: str = Field(..., max_length=50)
    resource_name: str = Field(..., max_length=255)
    allocated_amount: float
    allocated_percentage: Optional[float] = None
    start_date: datetime
    end_date: datetime
    is_confirmed: bool = False
    notes: Optional[str] = None


class ResourceAllocationCreate(ResourceAllocationBase):
    pass


class ResourceAllocationUpdate(BaseModel):
    resource_type: Optional[str] = Field(None, max_length=50)
    resource_name: Optional[str] = Field(None, max_length=255)
    allocated_amount: Optional[float] = None
    allocated_percentage: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_confirmed: Optional[bool] = None
    notes: Optional[str] = None


class ResourceAllocationResponse(ResourceAllocationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None

    class Config:
        from_attributes = True


# Stage Gate Schemas
class StageGateBase(BaseModel):
    initiative_id: int
    stage: StageGateTypeEnum
    stage_order: int = Field(..., ge=1, le=5)
    is_current: bool = False
    is_completed: bool = False
    expected_completion: Optional[datetime] = None
    criteria_checklist: Optional[List[Dict[str, Any]]] = None
    approval_required: bool = True
    notes: Optional[str] = None
    blockers: Optional[str] = None


class StageGateCreate(StageGateBase):
    pass


class StageGateUpdate(BaseModel):
    stage: Optional[StageGateTypeEnum] = None
    stage_order: Optional[int] = Field(None, ge=1, le=5)
    is_current: Optional[bool] = None
    is_completed: Optional[bool] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    expected_completion: Optional[datetime] = None
    criteria_checklist: Optional[List[Dict[str, Any]]] = None
    approval_required: Optional[bool] = None
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    notes: Optional[str] = None
    blockers: Optional[str] = None


class StageGateResponse(StageGateBase):
    id: int
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# External Integration Schemas
class ExternalIntegrationBase(BaseModel):
    integration_type: str = Field(..., max_length=50)
    integration_name: str = Field(..., max_length=255)
    config: Dict[str, Any]
    is_active: bool = True


class ExternalIntegrationCreate(ExternalIntegrationBase):
    pass


class ExternalIntegrationUpdate(BaseModel):
    integration_name: Optional[str] = Field(None, max_length=255)
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class ExternalIntegrationResponse(ExternalIntegrationBase):
    id: int
    last_sync_at: Optional[datetime] = None
    last_sync_status: Optional[str] = None
    sync_error: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None

    class Config:
        from_attributes = True


# Roadmap Bottleneck Schemas
class RoadmapBottleneckBase(BaseModel):
    bottleneck_type: str = Field(..., max_length=50)
    severity: str = Field(..., max_length=20)
    title: str = Field(..., max_length=255)
    description: str
    affected_initiatives: Optional[List[int]] = None
    ai_recommendation: Optional[str] = None
    suggested_actions: Optional[List[Dict[str, Any]]] = None


class RoadmapBottleneckCreate(RoadmapBottleneckBase):
    pass


class RoadmapBottleneckUpdate(BaseModel):
    severity: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = None
    is_resolved: Optional[bool] = None
    resolution_notes: Optional[str] = None


class RoadmapBottleneckResponse(RoadmapBottleneckBase):
    id: int
    is_resolved: bool
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    detected_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# AI Agent Request/Response Schemas
class InitiativeSequencingRequest(BaseModel):
    initiatives: List[Dict[str, Any]]
    dependencies: Optional[List[Dict[str, Any]]] = None
    constraints: Optional[Dict[str, Any]] = None


class InitiativeSequencingResponse(BaseModel):
    recommended_sequence: List[int]
    reasoning: str
    dependencies_identified: List[Dict[str, Any]]
    estimated_timeline: Optional[str] = None


class BottleneckDetectionRequest(BaseModel):
    roadmap_timeline_id: Optional[int] = None
    initiative_ids: Optional[List[int]] = None


class BottleneckDetectionResponse(BaseModel):
    bottlenecks: List[Dict[str, Any]]
    critical_path: List[int]
    resource_conflicts: List[Dict[str, Any]]
    recommendations: List[str]


class TimelineFeasibilityRequest(BaseModel):
    initiative_data: Dict[str, Any]
    proposed_timeline: Dict[str, Any]
    historical_data: Optional[Dict[str, Any]] = None


class TimelineFeasibilityResponse(BaseModel):
    is_feasible: bool
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    reasoning: str
    suggested_adjustments: Optional[Dict[str, Any]] = None
    risks: List[str]


class DependencyResolutionRequest(BaseModel):
    dependency_data: Dict[str, Any]
    initiative_a: Dict[str, Any]
    initiative_b: Dict[str, Any]


class DependencyResolutionResponse(BaseModel):
    resolution_strategies: List[Dict[str, Any]]
    recommended_approach: str
    estimated_impact: str
    alternative_paths: List[Dict[str, Any]]


# Capacity Planning Schemas
class CapacityOverview(BaseModel):
    resource_type: str
    total_capacity: float
    allocated_capacity: float
    available_capacity: float
    utilization_percentage: float
    overallocated: bool


class CapacityPlanningResponse(BaseModel):
    overview: List[CapacityOverview]
    team_allocations: List[ResourceAllocationResponse]
    budget_summary: Dict[str, float]
    warnings: List[str]


# Dependency Graph Schemas
class DependencyNode(BaseModel):
    initiative_id: int
    title: str
    status: str
    dependencies_count: int
    dependents_count: int


class DependencyEdge(BaseModel):
    from_initiative_id: int
    to_initiative_id: int
    dependency_type: str
    is_blocking: bool
    is_resolved: bool


class DependencyGraphResponse(BaseModel):
    nodes: List[DependencyNode]
    edges: List[DependencyEdge]
    critical_path: List[int]
    circular_dependencies: List[List[int]]
