"""
Roadmap Service for Module 3
Handles roadmap timeline management, dependency resolution, and capacity planning
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from collections import defaultdict, deque

from app.models.roadmap import (
    RoadmapTimeline, InitiativeDependency, ResourceAllocation,
    StageGate, RoadmapBottleneck, DependencyType, StageGateType
)
from app.models.initiative import Initiative
from app.schemas.roadmap import (
    RoadmapTimelineCreate, RoadmapTimelineUpdate,
    InitiativeDependencyCreate, InitiativeDependencyUpdate,
    ResourceAllocationCreate, ResourceAllocationUpdate,
    StageGateCreate, StageGateUpdate,
    CapacityOverview, DependencyNode, DependencyEdge
)


class RoadmapService:
    """Service for roadmap and dependency management"""
    
    @staticmethod
    def create_roadmap_timeline(db: Session, roadmap: RoadmapTimelineCreate, user_id: int) -> RoadmapTimeline:
        """Create a new roadmap timeline"""
        db_roadmap = RoadmapTimeline(
            **roadmap.dict(),
            created_by=user_id
        )
        db.add(db_roadmap)
        db.commit()
        db.refresh(db_roadmap)
        return db_roadmap
    
    @staticmethod
    def get_roadmap_timeline(db: Session, roadmap_id: int) -> Optional[RoadmapTimeline]:
        """Get a roadmap timeline by ID"""
        return db.query(RoadmapTimeline).filter(RoadmapTimeline.id == roadmap_id).first()
    
    @staticmethod
    def get_all_roadmap_timelines(db: Session, skip: int = 0, limit: int = 100) -> List[RoadmapTimeline]:
        """Get all roadmap timelines"""
        return db.query(RoadmapTimeline).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_roadmap_timeline(db: Session, roadmap_id: int, roadmap: RoadmapTimelineUpdate) -> Optional[RoadmapTimeline]:
        """Update a roadmap timeline"""
        db_roadmap = db.query(RoadmapTimeline).filter(RoadmapTimeline.id == roadmap_id).first()
        if not db_roadmap:
            return None
        
        update_data = roadmap.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_roadmap, field, value)
        
        db.commit()
        db.refresh(db_roadmap)
        return db_roadmap
    
    @staticmethod
    def delete_roadmap_timeline(db: Session, roadmap_id: int) -> bool:
        """Delete a roadmap timeline"""
        db_roadmap = db.query(RoadmapTimeline).filter(RoadmapTimeline.id == roadmap_id).first()
        if not db_roadmap:
            return False
        
        db.delete(db_roadmap)
        db.commit()
        return True
    
    # Dependency Management
    @staticmethod
    def create_dependency(db: Session, dependency: InitiativeDependencyCreate, user_id: int) -> InitiativeDependency:
        """Create a new initiative dependency"""
        # Check for circular dependencies
        if RoadmapService._would_create_cycle(db, dependency.initiative_id, dependency.depends_on_id):
            raise ValueError("Creating this dependency would create a circular dependency")
        
        db_dependency = InitiativeDependency(
            **dependency.dict(),
            created_by=user_id
        )
        db.add(db_dependency)
        db.commit()
        db.refresh(db_dependency)
        return db_dependency
    
    @staticmethod
    def get_initiative_dependencies(db: Session, initiative_id: int) -> List[InitiativeDependency]:
        """Get all dependencies for an initiative"""
        return db.query(InitiativeDependency).filter(
            InitiativeDependency.initiative_id == initiative_id
        ).all()
    
    @staticmethod
    def get_initiative_dependents(db: Session, initiative_id: int) -> List[InitiativeDependency]:
        """Get all initiatives that depend on this initiative"""
        return db.query(InitiativeDependency).filter(
            InitiativeDependency.depends_on_id == initiative_id
        ).all()
    
    @staticmethod
    def update_dependency(db: Session, dependency_id: int, dependency: InitiativeDependencyUpdate) -> Optional[InitiativeDependency]:
        """Update a dependency"""
        db_dependency = db.query(InitiativeDependency).filter(InitiativeDependency.id == dependency_id).first()
        if not db_dependency:
            return None
        
        update_data = dependency.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_dependency, field, value)
        
        if update_data.get('is_resolved') and not db_dependency.resolved_at:
            db_dependency.resolved_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_dependency)
        return db_dependency
    
    @staticmethod
    def delete_dependency(db: Session, dependency_id: int) -> bool:
        """Delete a dependency"""
        db_dependency = db.query(InitiativeDependency).filter(InitiativeDependency.id == dependency_id).first()
        if not db_dependency:
            return False
        
        db.delete(db_dependency)
        db.commit()
        return True
    
    @staticmethod
    def _would_create_cycle(db: Session, from_id: int, to_id: int) -> bool:
        """Check if adding a dependency would create a circular dependency"""
        # Use BFS to check if there's already a path from to_id to from_id
        visited = set()
        queue = deque([to_id])
        
        while queue:
            current = queue.popleft()
            if current == from_id:
                return True
            
            if current in visited:
                continue
            visited.add(current)
            
            # Get all dependencies of current initiative
            dependencies = db.query(InitiativeDependency).filter(
                InitiativeDependency.initiative_id == current
            ).all()
            
            for dep in dependencies:
                if dep.depends_on_id not in visited:
                    queue.append(dep.depends_on_id)
        
        return False
    
    @staticmethod
    def get_dependency_graph(db: Session, roadmap_id: Optional[int] = None) -> Dict[str, Any]:
        """Get the full dependency graph"""
        # Get initiatives
        query = db.query(Initiative)
        if roadmap_id:
            query = query.filter(Initiative.roadmap_timeline_id == roadmap_id)
        initiatives = query.all()
        
        # Get all dependencies
        initiative_ids = [i.id for i in initiatives]
        dependencies = db.query(InitiativeDependency).filter(
            InitiativeDependency.initiative_id.in_(initiative_ids)
        ).all()
        
        # Build nodes
        nodes = []
        for initiative in initiatives:
            deps_count = len([d for d in dependencies if d.initiative_id == initiative.id])
            dependents_count = len([d for d in dependencies if d.depends_on_id == initiative.id])
            
            nodes.append(DependencyNode(
                initiative_id=initiative.id,
                title=initiative.title,
                status=initiative.status.value,
                dependencies_count=deps_count,
                dependents_count=dependents_count
            ))
        
        # Build edges
        edges = []
        for dep in dependencies:
            edges.append(DependencyEdge(
                from_initiative_id=dep.initiative_id,
                to_initiative_id=dep.depends_on_id,
                dependency_type=dep.dependency_type.value,
                is_blocking=dep.is_blocking,
                is_resolved=dep.is_resolved
            ))
        
        # Find critical path and circular dependencies
        critical_path = RoadmapService._find_critical_path(initiatives, dependencies)
        circular_deps = RoadmapService._find_circular_dependencies(initiatives, dependencies)
        
        return {
            "nodes": nodes,
            "edges": edges,
            "critical_path": critical_path,
            "circular_dependencies": circular_deps
        }
    
    @staticmethod
    def _find_critical_path(initiatives: List[Initiative], dependencies: List[InitiativeDependency]) -> List[int]:
        """Find the critical path through the dependency graph"""
        # Build adjacency list
        graph = defaultdict(list)
        for dep in dependencies:
            graph[dep.depends_on_id].append(dep.initiative_id)
        
        # Find longest path (critical path)
        def dfs(node, visited, path):
            visited.add(node)
            path.append(node)
            
            max_path = list(path)
            for neighbor in graph[node]:
                if neighbor not in visited:
                    candidate_path = dfs(neighbor, visited, path)
                    if len(candidate_path) > len(max_path):
                        max_path = candidate_path
            
            path.pop()
            visited.remove(node)
            return max_path
        
        # Find all root nodes (no dependencies)
        all_nodes = {i.id for i in initiatives}
        dependent_nodes = {dep.initiative_id for dep in dependencies}
        root_nodes = all_nodes - dependent_nodes
        
        longest_path = []
        for root in root_nodes:
            path = dfs(root, set(), [])
            if len(path) > len(longest_path):
                longest_path = path
        
        return longest_path
    
    @staticmethod
    def _find_circular_dependencies(initiatives: List[Initiative], dependencies: List[InitiativeDependency]) -> List[List[int]]:
        """Find all circular dependencies in the graph"""
        graph = defaultdict(list)
        for dep in dependencies:
            graph[dep.initiative_id].append(dep.depends_on_id)
        
        cycles = []
        visited = set()
        rec_stack = set()
        
        def dfs(node, path):
            visited.add(node)
            rec_stack.add(node)
            path.append(node)
            
            for neighbor in graph[node]:
                if neighbor not in visited:
                    dfs(neighbor, path)
                elif neighbor in rec_stack:
                    # Found a cycle
                    cycle_start = path.index(neighbor)
                    cycle = path[cycle_start:]
                    if cycle not in cycles:
                        cycles.append(cycle)
            
            path.pop()
            rec_stack.remove(node)
        
        for initiative in initiatives:
            if initiative.id not in visited:
                dfs(initiative.id, [])
        
        return cycles
    
    # Resource Allocation
    @staticmethod
    def create_resource_allocation(db: Session, allocation: ResourceAllocationCreate, user_id: int) -> ResourceAllocation:
        """Create a new resource allocation"""
        db_allocation = ResourceAllocation(
            **allocation.dict(),
            created_by=user_id
        )
        db.add(db_allocation)
        db.commit()
        db.refresh(db_allocation)
        return db_allocation
    
    @staticmethod
    def get_resource_allocations(db: Session, initiative_id: Optional[int] = None) -> List[ResourceAllocation]:
        """Get resource allocations, optionally filtered by initiative"""
        query = db.query(ResourceAllocation)
        if initiative_id:
            query = query.filter(ResourceAllocation.initiative_id == initiative_id)
        return query.all()
    
    @staticmethod
    def update_resource_allocation(db: Session, allocation_id: int, allocation: ResourceAllocationUpdate) -> Optional[ResourceAllocation]:
        """Update a resource allocation"""
        db_allocation = db.query(ResourceAllocation).filter(ResourceAllocation.id == allocation_id).first()
        if not db_allocation:
            return None
        
        update_data = allocation.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_allocation, field, value)
        
        db.commit()
        db.refresh(db_allocation)
        return db_allocation
    
    @staticmethod
    def delete_resource_allocation(db: Session, allocation_id: int) -> bool:
        """Delete a resource allocation"""
        db_allocation = db.query(ResourceAllocation).filter(ResourceAllocation.id == allocation_id).first()
        if not db_allocation:
            return False
        
        db.delete(db_allocation)
        db.commit()
        return True
    
    @staticmethod
    def get_capacity_overview(db: Session, resource_type: Optional[str] = None) -> List[CapacityOverview]:
        """Get capacity overview by resource type"""
        query = db.query(
            ResourceAllocation.resource_type,
            ResourceAllocation.resource_name,
            func.sum(ResourceAllocation.allocated_amount).label('allocated')
        ).group_by(ResourceAllocation.resource_type, ResourceAllocation.resource_name)
        
        if resource_type:
            query = query.filter(ResourceAllocation.resource_type == resource_type)
        
        results = query.all()
        
        # Calculate capacity overview
        capacity_by_type = defaultdict(lambda: {'allocated': 0.0, 'total': 100.0})  # Assume 100% capacity
        
        for result in results:
            capacity_by_type[result.resource_type]['allocated'] += result.allocated
        
        overviews = []
        for res_type, data in capacity_by_type.items():
            allocated = data['allocated']
            total = data['total']
            available = max(0, total - allocated)
            utilization = (allocated / total * 100) if total > 0 else 0
            
            overviews.append(CapacityOverview(
                resource_type=res_type,
                total_capacity=total,
                allocated_capacity=allocated,
                available_capacity=available,
                utilization_percentage=utilization,
                overallocated=allocated > total
            ))
        
        return overviews
    
    # Stage Gate Management
    @staticmethod
    def create_stage_gate(db: Session, stage_gate: StageGateCreate) -> StageGate:
        """Create a new stage gate"""
        db_stage_gate = StageGate(**stage_gate.dict())
        db.add(db_stage_gate)
        db.commit()
        db.refresh(db_stage_gate)
        return db_stage_gate
    
    @staticmethod
    def get_initiative_stage_gates(db: Session, initiative_id: int) -> List[StageGate]:
        """Get all stage gates for an initiative"""
        return db.query(StageGate).filter(
            StageGate.initiative_id == initiative_id
        ).order_by(StageGate.stage_order).all()
    
    @staticmethod
    def update_stage_gate(db: Session, stage_gate_id: int, stage_gate: StageGateUpdate) -> Optional[StageGate]:
        """Update a stage gate"""
        db_stage_gate = db.query(StageGate).filter(StageGate.id == stage_gate_id).first()
        if not db_stage_gate:
            return None
        
        update_data = stage_gate.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_stage_gate, field, value)
        
        db.commit()
        db.refresh(db_stage_gate)
        return db_stage_gate
    
    @staticmethod
    def initialize_stage_gates_for_initiative(db: Session, initiative_id: int) -> List[StageGate]:
        """Initialize all 5 stage gates for a new initiative"""
        stages = [
            (StageGateType.DISCOVERY, 1),
            (StageGateType.POC, 2),
            (StageGateType.PILOT, 3),
            (StageGateType.PRODUCTION, 4),
            (StageGateType.MONITORING, 5)
        ]
        
        stage_gates = []
        for stage, order in stages:
            db_stage_gate = StageGate(
                initiative_id=initiative_id,
                stage=stage,
                stage_order=order,
                is_current=(order == 1),  # First stage is current
                is_completed=False
            )
            db.add(db_stage_gate)
            stage_gates.append(db_stage_gate)
        
        db.commit()
        for sg in stage_gates:
            db.refresh(sg)
        
        return stage_gates
