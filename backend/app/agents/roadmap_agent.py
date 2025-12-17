"""
Roadmap Agent

Module 3: Planning & sequencing initiatives

Responsibilities:
- Suggest optimal initiative sequencing
- Detect roadmap bottlenecks
- Validate timeline feasibility
- Recommend dependency resolution strategies

Guardrails:
- Risk assessment for all recommendations
- Alternative approaches provided
- Confidence scores on timeline estimates
- Source-linked reasoning
"""

from typing import Dict, Any, List, Optional
from .base_agent import BaseAgent


class RoadmapAgent(BaseAgent):
    """
    Roadmap Agent for planning and sequencing AI initiatives.
    
    This agent helps optimize initiative sequencing, detect bottlenecks,
    and provide timeline feasibility assessments.
    """
    
    async def suggest_initiative_sequencing(
        self, 
        initiatives: List[Dict[str, Any]],
        dependencies: List[Dict[str, Any]],
        constraints: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Suggest optimal sequencing for initiatives based on dependencies and constraints.
        
        Args:
            initiatives: List of initiatives to sequence
            dependencies: List of dependencies between initiatives
            constraints: Optional constraints (team capacity, budget timeline, etc.)
            
        Returns:
            Dictionary with recommended sequence and reasoning
        """
        prompt = f"""
        As a Roadmap Co-Pilot, analyze these AI initiatives and suggest an optimal execution sequence:
        
        Initiatives ({len(initiatives)}):
        {initiatives}
        
        Dependencies:
        {dependencies}
        
        Constraints:
        {constraints or "No specific constraints provided"}
        
        Consider:
        1. Dependency relationships (what must come first)
        2. Team capacity and skill availability
        3. Strategic priorities and business value
        4. Risk levels and complexity
        5. Quick wins vs. long-term investments
        6. Resource conflicts and bottlenecks
        
        Provide:
        1. Recommended sequence (ordered list of initiative IDs)
        2. Reasoning for the sequence
        3. Parallel execution opportunities
        4. Critical path identification
        5. Timeline estimation
        6. Risk considerations
        7. Alternative sequencing options
        
        Return as JSON:
        {{
          "recommended_sequence": [1, 3, 2, 5, 4],
          "reasoning": "Detailed explanation of sequencing logic...",
          "parallel_groups": [[1, 3], [2, 5]],
          "critical_path": [1, 2, 4],
          "estimated_timeline": "18 months",
          "phases": [
            {{"phase": "Q1 2024", "initiatives": [1, 3], "rationale": "..."}},
            {{"phase": "Q2 2024", "initiatives": [2, 5], "rationale": "..."}}
          ],
          "risks": ["risk1", "risk2"],
          "alternative_sequences": [
            {{"name": "Fast Track", "sequence": [3, 1, 2, 4, 5], "rationale": "..."}}
          ],
          "confidence": 85
        }}
        """
        
        system_message = "You are a Roadmap Co-Pilot specializing in AI initiative sequencing and dependency management."
        
        result = await self._call_openai(
            prompt=prompt,
            system_message=system_message,
            temperature=0.5,
            response_format={"type": "json_object"}
        )
        
        return result
    
    async def detect_roadmap_bottlenecks(
        self, 
        roadmap_data: Dict[str, Any],
        resource_allocations: List[Dict[str, Any]],
        dependencies: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Detect bottlenecks in the roadmap (resource conflicts, dependency chains, etc.).
        
        Args:
            roadmap_data: Current roadmap configuration
            resource_allocations: Team and budget allocations
            dependencies: Initiative dependencies
            
        Returns:
            Dictionary with detected bottlenecks and recommendations
        """
        prompt = f"""
        As a Roadmap Co-Pilot, analyze this roadmap for bottlenecks and constraints:
        
        Roadmap:
        {roadmap_data}
        
        Resource Allocations:
        {resource_allocations}
        
        Dependencies:
        {dependencies}
        
        Identify:
        1. Resource bottlenecks (overallocated teams, budget constraints)
        2. Dependency bottlenecks (blocking initiatives, circular dependencies)
        3. Timeline bottlenecks (unrealistic schedules, compressed timelines)
        4. Vendor/external dependencies
        5. Data platform constraints
        6. Skill gaps or capacity issues
        
        For each bottleneck, provide:
        - Type (resource, dependency, timeline, vendor, data, skill)
        - Severity (critical, high, medium, low)
        - Affected initiatives
        - Impact description
        - Recommended resolution strategies
        - Alternative approaches
        
        Return as JSON:
        {{
          "bottlenecks": [
            {{
              "type": "resource",
              "severity": "high",
              "title": "Data Science Team Overallocation",
              "description": "Team allocated 150% capacity in Q2 2024",
              "affected_initiatives": [1, 3, 5],
              "impact": "Delays of 2-3 months likely",
              "recommendations": ["Hire contractors", "Reschedule initiative 5", "Reduce scope"],
              "estimated_delay": "2 months"
            }}
          ],
          "critical_path": [1, 2, 4],
          "resource_conflicts": [
            {{"resource": "Data Science Team", "overallocation": 50, "period": "Q2 2024"}}
          ],
          "dependency_chains": [
            {{"chain": [1, 2, 3], "length": 3, "risk": "high"}}
          ],
          "recommendations": ["rec1", "rec2", "rec3"],
          "priority_actions": ["action1", "action2"],
          "confidence": 80
        }}
        """
        
        system_message = "You are a Roadmap Co-Pilot specializing in bottleneck detection and resolution."
        
        result = await self._call_openai(
            prompt=prompt,
            system_message=system_message,
            temperature=0.4,
            response_format={"type": "json_object"}
        )
        
        return result
    
    async def validate_timeline_feasibility(
        self, 
        initiative_data: Dict[str, Any],
        proposed_timeline: Dict[str, Any],
        historical_data: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Validate if a proposed timeline is realistic based on initiative complexity and historical data.
        
        Args:
            initiative_data: Initiative details
            proposed_timeline: Proposed start and end dates
            historical_data: Optional historical data from similar initiatives
            
        Returns:
            Dictionary with feasibility assessment and recommendations
        """
        prompt = f"""
        As a Roadmap Co-Pilot, assess the feasibility of this proposed timeline:
        
        Initiative:
        Title: {initiative_data.get('title')}
        Description: {initiative_data.get('description')}
        AI Type: {initiative_data.get('ai_type')}
        Complexity: {initiative_data.get('technical_feasibility_score', 'Unknown')}
        Technologies: {initiative_data.get('technologies', [])}
        Team Size: {initiative_data.get('team_size', 'Unknown')}
        
        Proposed Timeline:
        Start Date: {proposed_timeline.get('start_date')}
        End Date: {proposed_timeline.get('end_date')}
        Duration: {proposed_timeline.get('duration_months')} months
        
        Historical Data:
        {historical_data or "No historical data available"}
        
        Assess:
        1. Is the timeline realistic?
        2. What are the key risks to the timeline?
        3. What buffer should be added?
        4. What are the critical milestones?
        5. What could accelerate or delay the timeline?
        
        Return as JSON:
        {{
          "is_feasible": true,
          "confidence_score": 0.75,
          "reasoning": "Detailed assessment...",
          "risks": [
            {{"risk": "Data availability delays", "likelihood": "medium", "impact": "2 weeks"}},
            {{"risk": "Integration complexity", "likelihood": "high", "impact": "1 month"}}
          ],
          "suggested_timeline": {{
            "start_date": "2024-04-01",
            "end_date": "2024-10-31",
            "duration_months": 7,
            "buffer_months": 1
          }},
          "milestones": [
            {{"name": "Discovery Complete", "date": "2024-05-15", "critical": true}},
            {{"name": "PoC Complete", "date": "2024-07-31", "critical": true}}
          ],
          "accelerators": ["Pre-trained models available", "Experienced team"],
          "deaccelerators": ["Data quality issues", "Vendor dependencies"],
          "recommendations": ["Add 1 month buffer", "Front-load data preparation"],
          "confidence": 75
        }}
        """
        
        system_message = "You are a Roadmap Co-Pilot specializing in timeline estimation and risk assessment."
        
        result = await self._call_openai(
            prompt=prompt,
            system_message=system_message,
            temperature=0.4,
            response_format={"type": "json_object"}
        )
        
        return result
    
    async def recommend_dependency_resolution(
        self, 
        dependency_data: Dict[str, Any],
        initiative_a: Dict[str, Any],
        initiative_b: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Recommend strategies to resolve or work around a dependency.
        
        Args:
            dependency_data: Dependency details
            initiative_a: Initiative that depends on B
            initiative_b: Initiative that A depends on
            
        Returns:
            Dictionary with resolution strategies and recommendations
        """
        prompt = f"""
        As a Roadmap Co-Pilot, recommend strategies to resolve this dependency:
        
        Dependency:
        Type: {dependency_data.get('dependency_type')}
        Description: {dependency_data.get('description')}
        Is Blocking: {dependency_data.get('is_blocking')}
        
        Initiative A (Dependent): {initiative_a.get('title')}
        - Description: {initiative_a.get('description')}
        - Status: {initiative_a.get('status')}
        - Timeline: {initiative_a.get('start_date')} to {initiative_a.get('target_completion_date')}
        
        Initiative B (Dependency): {initiative_b.get('title')}
        - Description: {initiative_b.get('description')}
        - Status: {initiative_b.get('status')}
        - Timeline: {initiative_b.get('start_date')} to {initiative_b.get('target_completion_date')}
        
        Provide:
        1. Resolution strategies (parallel execution, decoupling, workarounds)
        2. Recommended approach with justification
        3. Impact assessment of each strategy
        4. Alternative paths if dependency cannot be resolved
        5. Timeline implications
        6. Resource implications
        
        Return as JSON:
        {{
          "resolution_strategies": [
            {{
              "strategy": "Parallel Development with Mocks",
              "description": "Develop A using mocked data/APIs from B",
              "feasibility": "high",
              "effort": "medium",
              "timeline_impact": "Saves 2 months",
              "risks": ["Integration issues", "Rework needed"],
              "benefits": ["Faster delivery", "Early testing"]
            }},
            {{
              "strategy": "Decouple Dependencies",
              "description": "Redesign A to not require B",
              "feasibility": "medium",
              "effort": "high",
              "timeline_impact": "Adds 1 month upfront, saves 3 months overall",
              "risks": ["Scope change", "Architecture complexity"],
              "benefits": ["Independence", "Flexibility"]
            }}
          ],
          "recommended_approach": "Parallel Development with Mocks",
          "justification": "Detailed reasoning...",
          "estimated_impact": "2 months faster delivery",
          "alternative_paths": [
            {{"path": "Wait for B to complete", "timeline": "6 months", "risk": "low"}},
            {{"path": "Use external vendor solution", "timeline": "3 months", "risk": "medium"}}
          ],
          "implementation_steps": ["step1", "step2", "step3"],
          "confidence": 80
        }}
        """
        
        system_message = "You are a Roadmap Co-Pilot specializing in dependency resolution and unblocking initiatives."
        
        result = await self._call_openai(
            prompt=prompt,
            system_message=system_message,
            temperature=0.5,
            response_format={"type": "json_object"}
        )
        
        return result
