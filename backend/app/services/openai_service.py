"""
OpenAI Service - Orchestrator for AI Agents

This service acts as a facade/orchestrator for all AI agents.
It maintains backward compatibility while delegating to specialized agent classes.
"""

from openai import OpenAI
from app.core.config import settings
from typing import Optional, Dict, Any, List

import logging

logger = logging.getLogger(__name__)

# Import all agents
from app.agents import (
    IntakeAgent,
    PortfolioAnalystAgent,
    RoadmapAgent,
    GovernanceAgent,
    ExecutiveAgent
)


class OpenAIService:
    """
    Service for interacting with OpenAI API for AI-powered features.
    
    This service orchestrates specialized AI agents and provides backward
    compatibility for existing code.
    """
    
    def __init__(self):
        # If the key is left as the placeholder value, calls to OpenAI will fail.
        # In that case we still want the API to respond quickly and clearly
        # (instead of the UI appearing to hang on "Parsing...").
        self.api_key_configured = bool(settings.openai_api_key) and (
            "your-openai-api-key-here" not in settings.openai_api_key
        )

        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.OPENAI_MODEL

        if not self.api_key_configured:
            logger.warning(
                "OpenAI API key is not configured (placeholder detected). "
                "Set OPEN_API_KEY in backend/.env to enable AI features."
            )
        
        # Initialize all agents
        self.intake_agent = IntakeAgent(self.client, self.model)
        self.portfolio_analyst = PortfolioAnalystAgent(self.client, self.model)
        self.roadmap_agent = RoadmapAgent(self.client, self.model)
        self.governance_agent = GovernanceAgent(self.client, self.model)
        self.executive_agent = ExecutiveAgent(self.client, self.model)
    
    # ========================================================================
    # Legacy Methods (for backward compatibility)
    # ========================================================================
    
    async def analyze_initiative_risks(self, initiative_data: Dict[str, Any]) -> Dict[str, Any]:
        """Legacy method - delegates to governance agent."""
        # This is a simplified risk analysis - full risk management is in governance agent
        return await self.governance_agent.draft_risk_statement(
            risk_data={"category": "general", "description": "Initial risk assessment", "severity": "medium"},
            initiative_data=initiative_data
        )
    
    async def generate_executive_summary(self, portfolio_data: Dict[str, Any]) -> str:
        """Legacy method - delegates to executive agent."""
        result = await self.executive_agent.generate_board_summary(
            portfolio_data=portfolio_data,
            period_start="Current Period",
            period_end="Current Period",
            max_paragraphs=3
        )
        if result.get("success"):
            import json
            data = json.loads(result["data"])
            return data.get("summary", "")
        return f"Error generating summary: {result.get('error', 'Unknown error')}"
    
    async def suggest_compliance_requirements(self, initiative_data: Dict[str, Any]) -> Dict[str, Any]:
        """Legacy method - delegates to governance agent."""
        return await self.governance_agent.map_regulations(initiative_data)
    
    async def calculate_initiative_priority(self, initiative_data: Dict[str, Any]) -> Dict[str, Any]:
        """Legacy method - delegates to portfolio analyst."""
        # Simplified version - full scoring is in calculate_initiative_scores
        return await self.portfolio_analyst.calculate_initiative_scores(
            initiative_data=initiative_data,
            dimensions_info=[]
        )
    
    # ========================================================================
    # Module 1: Intake Agent Methods
    # ========================================================================
    
    async def parse_unstructured_intake(self, text: str) -> Dict[str, Any]:
        """Parse unstructured text into structured initiative data."""
        if not self.api_key_configured:
            return {
                "success": False,
                "error": "OpenAI API key not configured. Set OPEN_API_KEY in backend/.env.",
                "agent": "OpenAIService",
            }
        return await self.intake_agent.parse_unstructured_intake(text)
    
    async def detect_missing_fields(self, initiative_data: Dict[str, Any]) -> Dict[str, Any]:
        """Detect missing required fields and generate follow-up questions."""
        if not self.api_key_configured:
            return {
                "success": False,
                "error": "OpenAI API key not configured. Set OPEN_API_KEY in backend/.env.",
                "agent": "OpenAIService",
            }
        return await self.intake_agent.detect_missing_fields(initiative_data)
    
    async def classify_use_case(self, initiative_data: Dict[str, Any]) -> Dict[str, Any]:
        """Automatically classify the AI use case."""
        if not self.api_key_configured:
            return {
                "success": False,
                "error": "OpenAI API key not configured. Set OPEN_API_KEY in backend/.env.",
                "agent": "OpenAIService",
            }
        return await self.intake_agent.classify_use_case(initiative_data)
    
    async def find_similar_initiatives(
        self, 
        initiative_data: Dict[str, Any], 
        existing_initiatives: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Find similar existing initiatives."""
        if not self.api_key_configured:
            return {
                "success": False,
                "error": "OpenAI API key not configured. Set OPEN_API_KEY in backend/.env.",
                "agent": "OpenAIService",
            }
        return await self.intake_agent.find_similar_initiatives(initiative_data, existing_initiatives)
    
    # ========================================================================
    # Module 2: Portfolio Analyst Methods
    # ========================================================================
    
    async def calculate_initiative_scores(
        self, 
        initiative_data: Dict[str, Any], 
        dimensions_info: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Calculate initiative scores with detailed justification."""
        return await self.portfolio_analyst.calculate_initiative_scores(initiative_data, dimensions_info)
    
    async def compare_initiatives(
        self, 
        initiative_a: Dict[str, Any], 
        initiative_b: Dict[str, Any],
        score_a: Dict[str, Any],
        score_b: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Compare two initiatives and explain ranking differences."""
        return await self.portfolio_analyst.compare_initiatives(initiative_a, initiative_b, score_a, score_b)
    
    async def analyze_portfolio_balance(self, portfolio_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze portfolio balance and provide rebalancing recommendations."""
        return await self.portfolio_analyst.analyze_portfolio_balance(portfolio_data)
    
    async def optimize_portfolio_scenario(
        self, 
        initiatives: List[Dict[str, Any]],
        constraints: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Optimize portfolio selection under constraints."""
        return await self.portfolio_analyst.optimize_portfolio_scenario(initiatives, constraints)
    
    # ========================================================================
    # Module 3: Roadmap Agent Methods
    # ========================================================================
    
    async def suggest_initiative_sequencing(
        self, 
        initiatives: List[Dict[str, Any]],
        dependencies: List[Dict[str, Any]],
        constraints: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Suggest optimal sequencing for initiatives."""
        return await self.roadmap_agent.suggest_initiative_sequencing(initiatives, dependencies, constraints)
    
    async def detect_roadmap_bottlenecks(
        self, 
        roadmap_data: Dict[str, Any],
        resource_allocations: List[Dict[str, Any]],
        dependencies: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Detect bottlenecks in the roadmap."""
        return await self.roadmap_agent.detect_roadmap_bottlenecks(roadmap_data, resource_allocations, dependencies)
    
    async def validate_timeline_feasibility(
        self, 
        initiative_data: Dict[str, Any],
        proposed_timeline: Dict[str, Any],
        historical_data: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Validate if a proposed timeline is realistic."""
        return await self.roadmap_agent.validate_timeline_feasibility(initiative_data, proposed_timeline, historical_data)
    
    async def recommend_dependency_resolution(
        self, 
        dependency_data: Dict[str, Any],
        initiative_a: Dict[str, Any],
        initiative_b: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Recommend strategies to resolve or work around a dependency."""
        return await self.roadmap_agent.recommend_dependency_resolution(dependency_data, initiative_a, initiative_b)
    
    # ========================================================================
    # Module 4: Governance Agent Methods
    # ========================================================================
    
    async def check_compliance_completeness(
        self, 
        initiative_data: Dict[str, Any],
        evidence_documents: List[Dict[str, Any]],
        risk_tier: str
    ) -> Dict[str, Any]:
        """Check completeness of governance artifacts."""
        return await self.governance_agent.check_compliance_completeness(initiative_data, evidence_documents, risk_tier)
    
    async def map_regulations(self, initiative_data: Dict[str, Any]) -> Dict[str, Any]:
        """Map initiative to applicable regulations."""
        return await self.governance_agent.map_regulations(initiative_data)
    
    async def draft_risk_statement(
        self, 
        risk_data: Dict[str, Any],
        initiative_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Draft clear, actionable risk statements."""
        return await self.governance_agent.draft_risk_statement(risk_data, initiative_data)
    
    async def recommend_risk_controls(
        self, 
        risk_data: Dict[str, Any],
        initiative_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Recommend mitigation controls for identified risks."""
        return await self.governance_agent.recommend_risk_controls(risk_data, initiative_data)
    
    async def generate_model_card(
        self, 
        initiative_data: Dict[str, Any],
        model_details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate a model card template."""
        return await self.governance_agent.generate_model_card(initiative_data, model_details)
    
    # ========================================================================
    # Module 6: Executive Agent Methods
    # ========================================================================
    
    async def generate_executive_narrative(
        self,
        portfolio_data: Dict[str, Any],
        report_type: str,
        audience: str = "board",
        include_charts: bool = True,
        tone: str = "professional"
    ) -> Dict[str, Any]:
        """Generate narrative with charts for board/executive reporting."""
        return await self.executive_agent.generate_executive_narrative(
            portfolio_data, report_type, audience, include_charts, tone
        )
    
    async def explain_trade_offs(
        self,
        decision_context: Dict[str, Any],
        alternatives: List[Dict[str, Any]],
        constraints: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Explain portfolio trade-offs and decision rationale."""
        return await self.executive_agent.explain_trade_offs(decision_context, alternatives, constraints)
    
    async def prepare_talking_points(
        self,
        report_data: Dict[str, Any],
        audience: str = "board",
        max_points: int = 10
    ) -> Dict[str, Any]:
        """Generate talking points for presentations."""
        return await self.executive_agent.prepare_talking_points(report_data, audience, max_points)
    
    async def generate_board_summary(
        self,
        portfolio_data: Dict[str, Any],
        period_start: str,
        period_end: str,
        max_paragraphs: int = 3
    ) -> Dict[str, Any]:
        """Generate board-level summary (2-3 paragraphs)."""
        return await self.executive_agent.generate_board_summary(
            portfolio_data, period_start, period_end, max_paragraphs
        )
    
    async def generate_strategic_recommendations(
        self,
        portfolio_analysis: Dict[str, Any],
        trends: List[Dict[str, Any]],
        gaps: List[str]
    ) -> Dict[str, Any]:
        """Generate strategic recommendations based on portfolio analysis."""
        return await self.executive_agent.generate_strategic_recommendations(portfolio_analysis, trends, gaps)


# Singleton instance
openai_service = OpenAIService()
