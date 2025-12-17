"""
Roadmap and Dependency Management API Endpoints for Module 3
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.roadmap import RoadmapTimeline, InitiativeDependency, ResourceAllocation, StageGate
from app.schemas.roadmap import (
    RoadmapTimelineCreate, RoadmapTimelineUpdate, RoadmapTimelineResponse,
    InitiativeDependencyCreate, InitiativeDependencyUpdate, InitiativeDependencyResponse,
    ResourceAllocationCreate, ResourceAllocationUpdate, ResourceAllocationResponse,
    StageGateCreate, StageGateUpdate, StageGateResponse,
    DependencyGraphResponse, CapacityOverview,
    InitiativeSequencingRequest, InitiativeSequencingResponse,
    BottleneckDetectionResponse, TimelineFeasibilityRequest, TimelineFeasibilityResponse,
    DependencyResolutionRequest, DependencyResolutionResponse
)
from app.services.roadmap_service import RoadmapService
from app.services.openai_service import openai_service

router = APIRouter()


# ==================== Roadmap Timeline Endpoints ====================

@router.post("/timelines", response_model=RoadmapTimelineResponse, status_code=status.HTTP_201_CREATED)
async def create_roadmap_timeline(
    roadmap: RoadmapTimelineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new roadmap timeline"""
    return RoadmapService.create_roadmap_timeline(db, roadmap, current_user.id)


@router.get("/timelines", response_model=List[RoadmapTimelineResponse])
async def get_roadmap_timelines(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all roadmap timelines"""
    return RoadmapService.get_all_roadmap_timelines(db, skip, limit)


@router.get("/timelines/{roadmap_id}", response_model=RoadmapTimelineResponse)
async def get_roadmap_timeline(
    roadmap_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific roadmap timeline"""
    roadmap = RoadmapService.get_roadmap_timeline(db, roadmap_id)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap timeline not found")
    return roadmap


@router.put("/timelines/{roadmap_id}", response_model=RoadmapTimelineResponse)
async def update_roadmap_timeline(
    roadmap_id: int,
    roadmap: RoadmapTimelineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a roadmap timeline"""
    updated_roadmap = RoadmapService.update_roadmap_timeline(db, roadmap_id, roadmap)
    if not updated_roadmap:
        raise HTTPException(status_code=404, detail="Roadmap timeline not found")
    return updated_roadmap


@router.delete("/timelines/{roadmap_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_roadmap_timeline(
    roadmap_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a roadmap timeline"""
    success = RoadmapService.delete_roadmap_timeline(db, roadmap_id)
    if not success:
        raise HTTPException(status_code=404, detail="Roadmap timeline not found")


# ==================== Dependency Management Endpoints ====================

@router.post("/dependencies", response_model=InitiativeDependencyResponse, status_code=status.HTTP_201_CREATED)
async def create_dependency(
    dependency: InitiativeDependencyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new initiative dependency"""
    try:
        return RoadmapService.create_dependency(db, dependency, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/dependencies/initiative/{initiative_id}", response_model=List[InitiativeDependencyResponse])
async def get_initiative_dependencies(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all dependencies for an initiative"""
    return RoadmapService.get_initiative_dependencies(db, initiative_id)


@router.get("/dependencies/dependents/{initiative_id}", response_model=List[InitiativeDependencyResponse])
async def get_initiative_dependents(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all initiatives that depend on this initiative"""
    return RoadmapService.get_initiative_dependents(db, initiative_id)


@router.put("/dependencies/{dependency_id}", response_model=InitiativeDependencyResponse)
async def update_dependency(
    dependency_id: int,
    dependency: InitiativeDependencyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a dependency"""
    updated_dependency = RoadmapService.update_dependency(db, dependency_id, dependency)
    if not updated_dependency:
        raise HTTPException(status_code=404, detail="Dependency not found")
    return updated_dependency


@router.delete("/dependencies/{dependency_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dependency(
    dependency_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a dependency"""
    success = RoadmapService.delete_dependency(db, dependency_id)
    if not success:
        raise HTTPException(status_code=404, detail="Dependency not found")


@router.get("/dependencies/graph", response_model=DependencyGraphResponse)
async def get_dependency_graph(
    roadmap_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the full dependency graph"""
    return RoadmapService.get_dependency_graph(db, roadmap_id)


# ==================== Resource Allocation Endpoints ====================

@router.post("/resources", response_model=ResourceAllocationResponse, status_code=status.HTTP_201_CREATED)
async def create_resource_allocation(
    allocation: ResourceAllocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new resource allocation"""
    return RoadmapService.create_resource_allocation(db, allocation, current_user.id)


@router.get("/resources", response_model=List[ResourceAllocationResponse])
async def get_resource_allocations(
    initiative_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get resource allocations, optionally filtered by initiative"""
    return RoadmapService.get_resource_allocations(db, initiative_id)


@router.put("/resources/{allocation_id}", response_model=ResourceAllocationResponse)
async def update_resource_allocation(
    allocation_id: int,
    allocation: ResourceAllocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a resource allocation"""
    updated_allocation = RoadmapService.update_resource_allocation(db, allocation_id, allocation)
    if not updated_allocation:
        raise HTTPException(status_code=404, detail="Resource allocation not found")
    return updated_allocation


@router.delete("/resources/{allocation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource_allocation(
    allocation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a resource allocation"""
    success = RoadmapService.delete_resource_allocation(db, allocation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Resource allocation not found")


@router.get("/resources/capacity", response_model=List[CapacityOverview])
async def get_capacity_overview(
    resource_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get capacity overview by resource type"""
    return RoadmapService.get_capacity_overview(db, resource_type)


# ==================== Stage Gate Endpoints ====================

@router.post("/stage-gates", response_model=StageGateResponse, status_code=status.HTTP_201_CREATED)
async def create_stage_gate(
    stage_gate: StageGateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new stage gate"""
    return RoadmapService.create_stage_gate(db, stage_gate)


@router.get("/stage-gates/initiative/{initiative_id}", response_model=List[StageGateResponse])
async def get_initiative_stage_gates(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all stage gates for an initiative"""
    return RoadmapService.get_initiative_stage_gates(db, initiative_id)


@router.put("/stage-gates/{stage_gate_id}", response_model=StageGateResponse)
async def update_stage_gate(
    stage_gate_id: int,
    stage_gate: StageGateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a stage gate"""
    updated_stage_gate = RoadmapService.update_stage_gate(db, stage_gate_id, stage_gate)
    if not updated_stage_gate:
        raise HTTPException(status_code=404, detail="Stage gate not found")
    return updated_stage_gate


@router.post("/stage-gates/initialize/{initiative_id}", response_model=List[StageGateResponse])
async def initialize_stage_gates(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Initialize all 5 stage gates for an initiative"""
    return RoadmapService.initialize_stage_gates_for_initiative(db, initiative_id)


# ==================== AI Roadmap Co-Pilot Endpoints ====================

@router.post("/ai/suggest-sequencing", response_model=InitiativeSequencingResponse)
async def suggest_initiative_sequencing(
    request: InitiativeSequencingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Use AI to suggest optimal initiative sequencing based on dependencies and constraints.
    """
    try:
        result = await openai_service.suggest_initiative_sequencing(
            initiatives=request.initiatives,
            dependencies=request.dependencies,
            constraints=request.constraints
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error"))
        
        data = json.loads(result["data"])
        return InitiativeSequencingResponse(**data)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/detect-bottlenecks", response_model=BottleneckDetectionResponse)
async def detect_roadmap_bottlenecks(
    roadmap_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Use AI to detect bottlenecks in the roadmap (resource conflicts, dependency chains, etc.).
    """
    try:
        # Get roadmap data
        roadmap_data = {}
        if roadmap_id:
            roadmap = RoadmapService.get_roadmap_timeline(db, roadmap_id)
            if roadmap:
                roadmap_data = {
                    "id": roadmap.id,
                    "name": roadmap.name,
                    "start_date": str(roadmap.start_date),
                    "end_date": str(roadmap.end_date)
                }
        
        # Get resource allocations
        resource_allocations = RoadmapService.get_resource_allocations(db)
        allocations_data = [
            {
                "id": r.id,
                "initiative_id": r.initiative_id,
                "resource_type": r.resource_type,
                "resource_name": r.resource_name,
                "allocated_amount": r.allocated_amount,
                "start_date": str(r.start_date),
                "end_date": str(r.end_date)
            }
            for r in resource_allocations
        ]
        
        # Get dependency graph
        dep_graph = RoadmapService.get_dependency_graph(db, roadmap_id)
        dependencies_data = [
            {
                "from_initiative_id": edge.from_initiative_id,
                "to_initiative_id": edge.to_initiative_id,
                "dependency_type": edge.dependency_type,
                "is_blocking": edge.is_blocking
            }
            for edge in dep_graph.get("edges", [])
        ]
        
        result = await openai_service.detect_roadmap_bottlenecks(
            roadmap_data=roadmap_data,
            resource_allocations=allocations_data,
            dependencies=dependencies_data
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error"))
        
        data = json.loads(result["data"])
        return BottleneckDetectionResponse(**data)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/validate-timeline", response_model=TimelineFeasibilityResponse)
async def validate_timeline_feasibility(
    request: TimelineFeasibilityRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Use AI to validate if a proposed timeline is realistic.
    """
    try:
        result = await openai_service.validate_timeline_feasibility(
            initiative_data=request.initiative_data,
            proposed_timeline=request.proposed_timeline,
            historical_data=request.historical_data
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error"))
        
        data = json.loads(result["data"])
        return TimelineFeasibilityResponse(**data)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/resolve-dependency", response_model=DependencyResolutionResponse)
async def recommend_dependency_resolution(
    request: DependencyResolutionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Use AI to recommend strategies to resolve or work around a dependency.
    """
    try:
        result = await openai_service.recommend_dependency_resolution(
            dependency_data=request.dependency_data,
            initiative_a=request.initiative_a,
            initiative_b=request.initiative_b
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error"))
        
        data = json.loads(result["data"])
        return DependencyResolutionResponse(**data)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
