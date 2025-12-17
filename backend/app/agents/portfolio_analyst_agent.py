"""
Portfolio Analyst Agent

Module 2: Scoring & rationale for portfolio decisions

Responsibilities:
- Calculate initiative scores with detailed justification
- Compare initiatives and explain ranking differences
- Analyze portfolio balance and health
- Optimize portfolio selection under constraints

Guardrails:
- Explicit confidence indicators
- Alternative scenarios provided
- Trade-off explanations
- Source-linked reasoning
"""

from typing import Dict, Any, List
from .base_agent import BaseAgent


class PortfolioAnalystAgent(BaseAgent):
    """
    Portfolio Analyst Agent for scoring and portfolio optimization.
    
    This agent provides data-driven scoring, comparative analysis,
    and portfolio optimization recommendations.
    """
    
    async def calculate_initiative_scores(
        self, 
        initiative_data: Dict[str, Any], 
        dimensions_info: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculate initiative scores using AI with detailed justification.
        
        Args:
            initiative_data: Initiative details
            dimensions_info: Scoring dimensions and criteria
            
        Returns:
            Dictionary with scores, justification, and insights
        """
        prompt = f"""
        As a Portfolio Analyst, evaluate this AI initiative and provide detailed scoring:
        
        Initiative:
        Title: {initiative_data.get('title')}
        Description: {initiative_data.get('description')}
        Business Objective: {initiative_data.get('business_objective')}
        AI Type: {initiative_data.get('ai_type')}
        Strategic Domain: {initiative_data.get('strategic_domain')}
        Business Function: {initiative_data.get('business_function')}
        Technologies: {initiative_data.get('technologies', [])}
        Data Sources: {initiative_data.get('data_sources', [])}
        Expected ROI: {initiative_data.get('expected_roi')}
        Budget: ${initiative_data.get('budget_allocated', 0)}
        
        Scoring Dimensions:
        {dimensions_info}
        
        For each dimension and its criteria, provide:
        1. A score from 0-10
        2. Reasoning for the score
        
        Also provide:
        - Overall justification for the scoring
        - Top 3 strengths
        - Top 3 weaknesses
        - Top 3 recommendations for improvement
        - Confidence score (0-100) in your assessment
        
        Return as JSON:
        {{
          "scores": {{
            "Revenue uplift": 7.5,
            "Cost reduction": 6.0,
            ...
          }},
          "justification": "Overall explanation...",
          "strengths": ["strength1", "strength2", "strength3"],
          "weaknesses": ["weakness1", "weakness2", "weakness3"],
          "recommendations": ["rec1", "rec2", "rec3"],
          "confidence": 85
        }}
        """
        
        system_message = "You are a Portfolio Analyst specializing in AI initiative evaluation and prioritization."
        
        result = await self._call_openai(
            prompt=prompt,
            system_message=system_message,
            temperature=0.5,
            response_format={"type": "json_object"}
        )
        
        return result
    
    async def compare_initiatives(
        self, 
        initiative_a: Dict[str, Any], 
        initiative_b: Dict[str, Any],
        score_a: Dict[str, Any],
        score_b: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Compare two initiatives and explain ranking differences.
        
        Args:
            initiative_a: First initiative data
            initiative_b: Second initiative data
            score_a: Scores for initiative A
            score_b: Scores for initiative B
            
        Returns:
            Dictionary with comparison and justification
        """
        prompt = f"""
        Compare these two AI initiatives and explain why one ranks higher than the other:
        
        Initiative A: {initiative_a.get('title')}
        - Description: {initiative_a.get('description')}
        - Overall Score: {score_a.get('overall_score')}
        - Value Score: {score_a.get('value_score')}
        - Feasibility Score: {score_a.get('feasibility_score')}
        - Risk Score: {score_a.get('risk_score')}
        
        Initiative B: {initiative_b.get('title')}
        - Description: {initiative_b.get('description')}
        - Overall Score: {score_b.get('overall_score')}
        - Value Score: {score_b.get('value_score')}
        - Feasibility Score: {score_b.get('feasibility_score')}
        - Risk Score: {score_b.get('risk_score')}
        
        Provide:
        1. Which initiative ranks higher and why
        2. Key differentiators between them
        3. Dimension-by-dimension comparison
        4. Recommendation on which to prioritize
        5. Scenarios where the lower-ranked one might be preferred
        
        Return as JSON:
        {{
          "winner": "A" or "B",
          "score_difference": 1.5,
          "key_differentiators": ["diff1", "diff2", "diff3"],
          "dimension_comparison": {{
            "value": {{"a": 7.5, "b": 6.0, "difference": 1.5, "explanation": "..."}},
            "feasibility": {{...}},
            "risk": {{...}}
          }},
          "justification": "Detailed explanation...",
          "recommendation": "Prioritize A because...",
          "alternative_scenarios": ["When to consider B instead..."],
          "confidence": 85
        }}
        """
        
        system_message = "You are a Portfolio Analyst providing objective initiative comparisons."
        
        result = await self._call_openai(
            prompt=prompt,
            system_message=system_message,
            temperature=0.4,
            response_format={"type": "json_object"}
        )
        
        return result
    
    async def analyze_portfolio_balance(
        self, 
        portfolio_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze portfolio balance and provide rebalancing recommendations.
        
        Args:
            portfolio_data: Current portfolio composition and metrics
            
        Returns:
            Dictionary with analysis and recommendations
        """
        prompt = f"""
        Analyze this AI initiative portfolio and provide strategic recommendations:
        
        Portfolio Composition:
        Total Initiatives: {portfolio_data.get('total_initiatives')}
        By AI Type: {portfolio_data.get('by_ai_type')}
        By Risk Tier: {portfolio_data.get('by_risk_tier')}
        By Strategic Domain: {portfolio_data.get('by_strategic_domain')}
        By Status: {portfolio_data.get('by_status')}
        
        Financial:
        Total Budget: ${portfolio_data.get('total_budget', 0):,.2f}
        Total Expected ROI: {portfolio_data.get('total_expected_roi', 0)}%
        
        Provide:
        1. Portfolio health assessment
        2. Balance analysis (is the mix appropriate?)
        3. Risk concentration concerns
        4. Rebalancing recommendations
        5. Strategic gaps or opportunities
        6. Resource allocation suggestions
        
        Return as JSON:
        {{
          "health_score": 75,
          "health_assessment": "Overall assessment...",
          "balance_analysis": {{
            "ai_type_balance": "Analysis of AI type distribution...",
            "risk_balance": "Analysis of risk distribution...",
            "domain_balance": "Analysis of domain coverage..."
          }},
          "concerns": ["concern1", "concern2"],
          "recommendations": ["rec1", "rec2", "rec3"],
          "strategic_gaps": ["gap1", "gap2"],
          "rebalancing_actions": ["action1", "action2"],
          "confidence": 80
        }}
        """
        
        system_message = "You are a Portfolio Analyst specializing in AI portfolio strategy and optimization."
        
        result = await self._call_openai(
            prompt=prompt,
            system_message=system_message,
            temperature=0.6,
            response_format={"type": "json_object"}
        )
        
        return result
    
    async def optimize_portfolio_scenario(
        self, 
        initiatives: List[Dict[str, Any]],
        constraints: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Optimize portfolio selection under constraints.
        
        Args:
            initiatives: List of available initiatives with scores
            constraints: Budget, capacity, and other constraints
            
        Returns:
            Dictionary with optimized portfolio and justification
        """
        # Limit to top 10 initiatives for context window
        limited_initiatives = initiatives[:10] if len(initiatives) > 10 else initiatives
        
        prompt = f"""
        Optimize this AI initiative portfolio under the given constraints:
        
        Available Initiatives ({len(initiatives)}):
        {limited_initiatives}
        
        Constraints:
        Budget: ${constraints.get('budget_constraint', 0):,.2f}
        Capacity: {constraints.get('capacity_constraint')} initiatives
        Timeline: {constraints.get('timeline_constraint')} months
        Risk Tolerance: {constraints.get('risk_tolerance')}
        Target Mix: {constraints.get('target_portfolio_mix')}
        
        Recommend:
        1. Which initiatives to select
        2. Optimization strategy used
        3. Trade-offs made
        4. Expected outcomes
        5. Alternative scenarios
        6. Risk mitigation approach
        
        Return as JSON:
        {{
          "selected_initiative_ids": [1, 3, 5, 7],
          "total_budget": 2500000,
          "total_expected_roi": 45.5,
          "portfolio_mix": {{"genai": 40, "predictive": 30, "optimization": 20, "automation": 10}},
          "risk_distribution": {{"low": 2, "medium": 3, "high": 1}},
          "optimization_strategy": "Explanation of approach...",
          "trade_offs": ["tradeoff1", "tradeoff2"],
          "expected_outcomes": ["outcome1", "outcome2"],
          "alternative_scenarios": [
            {{"name": "Conservative", "selected_ids": [1, 2, 3], "rationale": "..."}},
            {{"name": "Aggressive", "selected_ids": [4, 5, 6], "rationale": "..."}}
          ],
          "confidence": 80
        }}
        """
        
        system_message = "You are a Portfolio Analyst specializing in portfolio optimization and resource allocation."
        
        result = await self._call_openai(
            prompt=prompt,
            system_message=system_message,
            temperature=0.5,
            response_format={"type": "json_object"}
        )
        
        return result
