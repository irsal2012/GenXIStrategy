"""
Executive Agent

Module 6: Reporting & storytelling for board/executives

Responsibilities:
- Generate executive narratives with chart recommendations
- Explain portfolio trade-offs
- Prepare talking points for presentations
- Generate board-level summaries
- Provide strategic recommendations

Guardrails:
- Board-appropriate language
- Data-driven narratives
- Confidence scores on recommendations
- Source-linked reasoning
"""

from typing import Dict, Any, List
from .base_agent import BaseAgent


class ExecutiveAgent(BaseAgent):
    """
    Executive Agent for board-level reporting and storytelling.
    
    This agent creates compelling narratives, explains trade-offs,
    and provides strategic recommendations for executive audiences.
    """
    
    async def generate_executive_narrative(
        self,
        portfolio_data: Dict[str, Any],
        report_type: str,
        audience: str = "board",
        include_charts: bool = True,
        tone: str = "professional"
    ) -> Dict[str, Any]:
        """
        Executive Briefing Agent: Generate narrative with charts for board/executive reporting.
        
        Args:
            portfolio_data: Portfolio metrics and data
            report_type: Type of report (board_slides, strategy_brief, quarterly_report)
            audience: Target audience (board, executive, technical)
            include_charts: Whether to recommend charts
            tone: Narrative tone (professional, concise, detailed)
            
        Returns:
            Dictionary with narrative, key points, and chart recommendations
        """
        prompt = f"""
        As a Chief AI Officer preparing a {report_type} for the {audience}, create a compelling executive narrative:
        
        Portfolio Data:
        Total Initiatives: {portfolio_data.get('total_initiatives')}
        Active Initiatives: {portfolio_data.get('active_initiatives')}
        Portfolio Health Score: {portfolio_data.get('health_score')}/100
        Total Budget: ${portfolio_data.get('total_budget', 0):,.2f}
        Total Value Delivered: ${portfolio_data.get('total_value_delivered', 0):,.2f}
        Average ROI: {portfolio_data.get('average_roi', 0):.1f}%
        Risk Score: {portfolio_data.get('risk_score', 0):.1f}
        Compliance Score: {portfolio_data.get('compliance_score', 0):.1f}%
        
        Additional Context:
        {portfolio_data.get('additional_context', '')}
        
        Create a {tone} narrative that:
        1. Opens with a strong executive summary
        2. Highlights key achievements and value delivered
        3. Addresses risk landscape and mitigation efforts
        4. Provides strategic recommendations
        5. Outlines next steps
        
        Tone Guidelines:
        - Professional: Board-appropriate, no jargon, data-driven
        - Concise: Brief, bullet-point friendly
        - Detailed: Comprehensive with supporting details
        
        {"Include specific chart recommendations (type, data, purpose) for visualizing key metrics." if include_charts else ""}
        
        Return as JSON:
        {{
          "narrative": "Full narrative text (2-3 paragraphs for board, more for detailed)",
          "key_points": ["point1", "point2", "point3", ...],
          "chart_recommendations": [
            {{
              "chart_type": "bar|line|pie|scatter",
              "title": "Chart title",
              "data_source": "Which metrics to visualize",
              "purpose": "Why this chart is important",
              "priority": "high|medium|low"
            }}
          ],
          "confidence_score": 0.85,
          "word_count": 250
        }}
        """
        
        system_message = "You are a Chief AI Officer creating executive communications. Be concise, data-driven, and board-appropriate."
        
        result = await self._call_openai(
            prompt=prompt,
            system_message=system_message,
            temperature=0.6,
            response_format={"type": "json_object"}
        )
        
        return result
    
    async def explain_trade_offs(
        self,
        decision_context: Dict[str, Any],
        alternatives: List[Dict[str, Any]],
        constraints: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Executive Briefing Agent: Explain portfolio trade-offs and decision rationale.
        
        Args:
            decision_context: Context of the decision being made
            alternatives: Alternative options considered
            constraints: Constraints that influenced the decision
            
        Returns:
            Dictionary with trade-off explanation and recommendation
        """
        prompt = f"""
        As a Chief AI Officer, explain the trade-offs in this portfolio decision:
        
        Decision Context:
        {decision_context}
        
        Alternatives Considered:
        {alternatives}
        
        Constraints:
        Budget: ${constraints.get('budget', 0):,.2f}
        Timeline: {constraints.get('timeline', 'Not specified')}
        Risk Tolerance: {constraints.get('risk_tolerance', 'Medium')}
        Strategic Priorities: {constraints.get('strategic_priorities', [])}
        
        Provide:
        1. Clear explanation of the trade-offs
        2. Why the chosen option is recommended
        3. What we're gaining vs. what we're giving up
        4. Risks and mitigation strategies
        5. Alternative scenarios where a different choice might be better
        
        Return as JSON:
        {{
          "explanation": "Clear, board-level explanation of trade-offs",
          "key_tradeoffs": [
            {{
              "dimension": "Cost vs. Speed",
              "chosen_option": "Prioritize speed",
              "tradeoff": "Higher cost but faster time-to-value",
              "impact": "Positive - captures market opportunity"
            }}
          ],
          "recommendation": "Recommended decision with justification",
          "risks": ["risk1", "risk2"],
          "mitigation": ["mitigation1", "mitigation2"],
          "alternative_scenarios": [
            "When to consider alternative A...",
            "When to consider alternative B..."
          ],
          "confidence_score": 0.80
        }}
        """
        
        system_message = "You are a Chief AI Officer explaining strategic trade-offs to the board."
        
        result = await self._call_openai(
            prompt=prompt,
            system_message=system_message,
            temperature=0.5,
            response_format={"type": "json_object"}
        )
        
        return result
    
    async def prepare_talking_points(
        self,
        report_data: Dict[str, Any],
        audience: str = "board",
        max_points: int = 10
    ) -> Dict[str, Any]:
        """
        Executive Briefing Agent: Generate talking points for presentations.
        
        Args:
            report_data: Report data and metrics
            audience: Target audience
            max_points: Maximum number of talking points
            
        Returns:
            Dictionary with talking points and supporting data
        """
        prompt = f"""
        As a Chief AI Officer preparing for a {audience} presentation, create concise talking points:
        
        Report Data:
        {report_data}
        
        Create {max_points} impactful talking points that:
        1. Lead with the most important message
        2. Are concise (1-2 sentences each)
        3. Include specific metrics/data
        4. Are appropriate for {audience} level
        5. Tell a coherent story
        
        Also anticipate likely questions and provide brief answers.
        
        Return as JSON:
        {{
          "talking_points": [
            "Portfolio health is strong at 85/100, driven by $2.5M in delivered value",
            "3 high-risk initiatives require immediate governance attention",
            ...
          ],
          "supporting_data": {{
            "point_1": {{"metric": "health_score", "value": 85, "context": "Above target of 80"}},
            ...
          }},
          "anticipated_questions": [
            {{
              "question": "What's driving the high risk score?",
              "answer": "3 initiatives involve sensitive customer data and require enhanced governance"
            }}
          ],
          "key_message": "One-sentence key takeaway"
        }}
        """
        
        system_message = f"You are a Chief AI Officer preparing talking points for a {audience} presentation."
        
        result = await self._call_openai(
            prompt=prompt,
            system_message=system_message,
            temperature=0.5,
            response_format={"type": "json_object"}
        )
        
        return result
    
    async def generate_board_summary(
        self,
        portfolio_data: Dict[str, Any],
        period_start: str,
        period_end: str,
        max_paragraphs: int = 3
    ) -> Dict[str, Any]:
        """
        Executive Briefing Agent: Generate board-level summary (2-3 paragraphs).
        
        Args:
            portfolio_data: Portfolio metrics and data
            period_start: Start of reporting period
            period_end: End of reporting period
            max_paragraphs: Maximum number of paragraphs
            
        Returns:
            Dictionary with summary, highlights, concerns, and recommendations
        """
        prompt = f"""
        As a Chief AI Officer, create a board-level executive summary for the period {period_start} to {period_end}:
        
        Portfolio Data:
        {portfolio_data}
        
        Create a {max_paragraphs}-paragraph summary that:
        1. Opens with overall portfolio status and health
        2. Highlights key achievements and value delivered
        3. Addresses concerns and risks
        4. Closes with strategic recommendations
        
        Keep it:
        - Board-appropriate (no technical jargon)
        - Data-driven (cite specific metrics)
        - Action-oriented (clear next steps)
        - Concise (each paragraph 3-4 sentences)
        
        Return as JSON:
        {{
          "summary": "Full multi-paragraph summary text",
          "highlights": [
            "Delivered $2.5M in value, exceeding target by 25%",
            "Completed 5 high-risk governance reviews",
            "Achieved 85% compliance score"
          ],
          "concerns": [
            "3 initiatives require immediate governance attention",
            "Data Science team at 150% capacity",
            "2 initiatives delayed due to vendor dependencies"
          ],
          "recommendations": [
            "Increase GenAI investment from 20% to 35%",
            "Hire 2 additional data scientists",
            "Accelerate governance reviews for pending initiatives"
          ],
          "confidence_score": 0.85
        }}
        """
        
        system_message = "You are a Chief AI Officer creating board-level executive summaries."
        
        result = await self._call_openai(
            prompt=prompt,
            system_message=system_message,
            temperature=0.6,
            response_format={"type": "json_object"}
        )
        
        return result
    
    async def generate_strategic_recommendations(
        self,
        portfolio_analysis: Dict[str, Any],
        trends: List[Dict[str, Any]],
        gaps: List[str]
    ) -> Dict[str, Any]:
        """
        Executive Briefing Agent: Generate strategic recommendations based on portfolio analysis.
        
        Args:
            portfolio_analysis: Current portfolio analysis
            trends: Identified trends
            gaps: Strategic gaps identified
            
        Returns:
            Dictionary with recommendations, rationale, and estimated impact
        """
        prompt = f"""
        As a Chief AI Officer, provide strategic recommendations based on this portfolio analysis:
        
        Portfolio Analysis:
        {portfolio_analysis}
        
        Trends Identified:
        {trends}
        
        Strategic Gaps:
        {gaps}
        
        Provide 5-7 strategic recommendations that:
        1. Address identified gaps and opportunities
        2. Leverage positive trends
        3. Mitigate risks
        4. Align with business strategy
        5. Are actionable with clear next steps
        
        For each recommendation, provide:
        - Clear recommendation statement
        - Rationale (why this matters)
        - Expected impact (quantified if possible)
        - Implementation timeline
        - Resource requirements
        - Success metrics
        
        Return as JSON:
        {{
          "recommendations": [
            {{
              "id": 1,
              "recommendation": "Increase GenAI investment from 20% to 35% of portfolio",
              "rationale": "Market opportunity in GenAI growing 300% YoY; current allocation underweights this opportunity",
              "expected_impact": {{
                "value": "$5M additional value over 12 months",
                "roi": "250%",
                "strategic_alignment": "High"
              }},
              "timeline": "Q1-Q2 2024",
              "resources_required": "$2M budget, 3 ML engineers",
              "success_metrics": ["3 new GenAI initiatives launched", "$5M value delivered"],
              "priority": "high"
            }}
          ],
          "rationale": {{
            "rec_1": "Detailed rationale for recommendation 1",
            ...
          }},
          "priority_order": [1, 3, 2, 5, 4],
          "estimated_impact": {{
            "total_value": "$15M over 18 months",
            "risk_reduction": "30%",
            "strategic_alignment": "Significantly improved"
          }},
          "quick_wins": [1, 3],
          "long_term_investments": [2, 5]
        }}
        """
        
        system_message = "You are a Chief AI Officer providing strategic recommendations to the board."
        
        result = await self._call_openai(
            prompt=prompt,
            system_message=system_message,
            temperature=0.6,
            response_format={"type": "json_object"}
        )
        
        return result
