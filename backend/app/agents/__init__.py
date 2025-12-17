"""
AI Agents Module

This module contains specialized AI agents for the GenXI Strategy platform.
Each agent follows the human-in-the-loop pattern with explicit guardrails.

Architecture Pattern: Human-in-the-loop, orchestrated agents

Agents:
- IntakeAgent: Structuring ideas from unstructured input
- PortfolioAnalystAgent: Scoring & rationale for portfolio decisions
- RoadmapAgent: Planning & sequencing initiatives
- GovernanceAgent: Compliance checks (NEVER auto-approves)
- ExecutiveAgent: Reporting & storytelling for board/executives

Guardrails (All Agents):
1. RBAC-aware memory - Agents receive filtered data based on permissions
2. Fail gracefully - All methods handle errors without crashing
3. Source-linked explanations - All recommendations include detailed reasoning
4. Explicit confidence indicators - Every response includes confidence scores

Human-in-the-loop Enforcement:
- All agents provide RECOMMENDATIONS only
- NO agent can auto-approve decisions
- Human approval required for all critical actions
- Explicit warnings in agent responses
"""

from .base_agent import BaseAgent
from .intake_agent import IntakeAgent
from .portfolio_analyst_agent import PortfolioAnalystAgent
from .roadmap_agent import RoadmapAgent
from .governance_agent import GovernanceAgent
from .executive_agent import ExecutiveAgent

__all__ = [
    "BaseAgent",
    "IntakeAgent",
    "PortfolioAnalystAgent",
    "RoadmapAgent",
    "GovernanceAgent",
    "ExecutiveAgent",
]
