from openai import OpenAI
from app.core.config import settings
from typing import Optional, Dict, Any, List


class OpenAIService:
    """Service for interacting with OpenAI API for AI-powered features."""
    
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
    
    async def analyze_initiative_risks(self, initiative_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze an AI initiative and suggest potential risks using OpenAI.
        
        Args:
            initiative_data: Dictionary containing initiative details
            
        Returns:
            Dictionary with suggested risks and mitigation strategies
        """
        prompt = f"""
        As an AI governance expert, analyze the following AI initiative and identify potential risks:
        
        Title: {initiative_data.get('title')}
        Description: {initiative_data.get('description')}
        Business Objective: {initiative_data.get('business_objective')}
        Technologies: {initiative_data.get('technologies', [])}
        
        Please identify:
        1. Technical risks
        2. Ethical risks
        3. Compliance risks
        4. Business risks
        5. Operational risks
        
        For each risk, provide:
        - Risk title
        - Description
        - Severity (critical/high/medium/low)
        - Likelihood (1-5)
        - Impact (1-5)
        - Suggested mitigation strategy
        
        Format the response as a structured JSON array.
        """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an AI governance and risk management expert."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            return {"success": True, "data": response.choices[0].message.content}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def generate_executive_summary(self, portfolio_data: Dict[str, Any]) -> str:
        """
        Generate an executive summary of the AI portfolio using OpenAI.
        
        Args:
            portfolio_data: Dictionary containing portfolio metrics and initiatives
            
        Returns:
            Executive summary text
        """
        prompt = f"""
        As a CAIO, create a concise executive summary for the board based on this AI portfolio data:
        
        Total Initiatives: {portfolio_data.get('total_initiatives')}
        Active Initiatives: {portfolio_data.get('active_initiatives')}
        Total Budget: ${portfolio_data.get('total_budget', 0):,.2f}
        Expected ROI: {portfolio_data.get('expected_roi', 0)}%
        High-Risk Initiatives: {portfolio_data.get('high_risk_count', 0)}
        Compliance Status: {portfolio_data.get('compliance_status')}
        
        Key Initiatives:
        {portfolio_data.get('key_initiatives', [])}
        
        Create a professional executive summary highlighting:
        1. Portfolio health and progress
        2. Key achievements and value delivered
        3. Risk landscape and mitigation efforts
        4. Strategic recommendations
        5. Next steps
        
        Keep it concise (2-3 paragraphs) and board-appropriate.
        """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a Chief AI Officer preparing board-level communications."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            return response.choices[0].message.content
        except Exception as e:
            return f"Error generating summary: {str(e)}"
    
    async def suggest_compliance_requirements(self, initiative_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Suggest relevant compliance requirements for an AI initiative.
        
        Args:
            initiative_data: Dictionary containing initiative details
            
        Returns:
            Dictionary with suggested compliance requirements
        """
        prompt = f"""
        Analyze this AI initiative and identify relevant compliance requirements:
        
        Title: {initiative_data.get('title')}
        Description: {initiative_data.get('description')}
        Technologies: {initiative_data.get('technologies', [])}
        Industry: {initiative_data.get('industry', 'General')}
        
        Identify applicable regulations and requirements from:
        - GDPR (EU)
        - AI Act (EU)
        - CCPA (California)
        - HIPAA (if healthcare-related)
        - SOC 2
        - ISO 27001
        - Industry-specific regulations
        
        For each requirement, provide:
        - Regulation name
        - Specific requirement
        - Why it applies
        - Recommended actions
        
        Format as structured JSON.
        """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a compliance and regulatory expert specializing in AI governance."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                response_format={"type": "json_object"}
            )
            
            return {"success": True, "data": response.choices[0].message.content}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def calculate_initiative_priority(self, initiative_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Use AI to help calculate and justify initiative priority scoring.
        
        Args:
            initiative_data: Dictionary containing initiative details
            
        Returns:
            Dictionary with priority scores and justification
        """
        prompt = f"""
        Evaluate this AI initiative and provide priority scoring:
        
        Title: {initiative_data.get('title')}
        Description: {initiative_data.get('description')}
        Business Objective: {initiative_data.get('business_objective')}
        Expected ROI: {initiative_data.get('expected_roi')}
        Budget: ${initiative_data.get('budget_allocated', 0)}
        
        Score the following on a scale of 0-10:
        1. Business Value Score - potential impact on business objectives
        2. Technical Feasibility Score - likelihood of successful implementation
        3. Strategic Alignment Score - alignment with company strategy
        4. Risk Score - overall risk level (higher = more risky)
        
        Provide:
        - Scores for each dimension
        - Overall priority recommendation (critical/high/medium/low)
        - Justification for each score
        - Key factors influencing the priority
        
        Format as structured JSON.
        """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a strategic AI portfolio manager."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.6,
                response_format={"type": "json_object"}
            )
            
            return {"success": True, "data": response.choices[0].message.content}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def parse_unstructured_intake(self, text: str) -> Dict[str, Any]:
        """
        Parse unstructured text into structured initiative data.
        
        Args:
            text: Unstructured description of an AI initiative
            
        Returns:
            Dictionary with extracted structured data
        """
        prompt = f"""
        Parse the following unstructured text about an AI initiative and extract structured information:
        
        Text: {text}
        
        Extract and return a JSON object with the following fields:
        - title: A concise title for the initiative
        - description: A clear description
        - business_objective: The business goal or objective
        - ai_type: One of [genai, predictive, optimization, automation]
        - strategic_domain: The strategic area (e.g., "Customer Experience", "Operations", "Innovation")
        - business_function: The business function (e.g., "Marketing", "Finance", "HR", "IT")
        - technologies: Array of relevant technologies mentioned
        - data_sources: Array of data sources mentioned or implied
        - stakeholders: Array of stakeholders mentioned
        - expected_roi: Estimated ROI if mentioned (as a number)
        - budget_allocated: Estimated budget if mentioned (as a number)
        
        If a field cannot be determined from the text, set it to null.
        """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an AI initiative intake specialist who extracts structured data from unstructured text."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            return {"success": True, "data": response.choices[0].message.content}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def detect_missing_fields(self, initiative_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Detect missing required fields and generate follow-up questions.
        
        Args:
            initiative_data: Partially filled initiative data
            
        Returns:
            Dictionary with missing fields and suggested questions
        """
        prompt = f"""
        Analyze this partially filled AI initiative intake form and identify missing critical information:
        
        Current Data: {initiative_data}
        
        Required fields that should be present:
        - title
        - description
        - business_objective
        - ai_type
        - strategic_domain
        - business_function
        - stakeholders
        - data_sources
        - expected_roi or estimated value
        
        For each missing or incomplete field, generate:
        1. The field name
        2. Why it's important
        3. A specific, contextual follow-up question to ask the user
        
        Return as JSON with structure:
        {
          "missing_fields": [
            {
              "field": "field_name",
              "importance": "why it matters",
              "question": "specific question to ask"
            }
          ],
          "completeness_score": 0-100
        }
        """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an AI intake specialist helping users complete initiative forms."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                response_format={"type": "json_object"}
            )
            
            return {"success": True, "data": response.choices[0].message.content}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def classify_use_case(self, initiative_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Automatically classify the AI use case based on description and details.
        
        Args:
            initiative_data: Initiative data to classify
            
        Returns:
            Dictionary with classification results
        """
        prompt = f"""
        Classify this AI initiative based on the provided information:
        
        Title: {initiative_data.get('title')}
        Description: {initiative_data.get('description')}
        Business Objective: {initiative_data.get('business_objective')}
        Technologies: {initiative_data.get('technologies', [])}
        
        Provide classification for:
        1. AI Type: [genai, predictive, optimization, automation]
        2. Strategic Domain: [Customer Experience, Operations, Innovation, Risk Management, etc.]
        3. Business Function: [Marketing, Sales, Finance, HR, IT, Operations, etc.]
        4. Risk Tier: [low, medium, high] based on complexity, data sensitivity, regulatory impact
        5. Confidence Score: 0-100 for each classification
        
        Return as JSON with structure:
        {
          "ai_type": {"value": "...", "confidence": 0-100, "reasoning": "..."},
          "strategic_domain": {"value": "...", "confidence": 0-100, "reasoning": "..."},
          "business_function": {"value": "...", "confidence": 0-100, "reasoning": "..."},
          "risk_tier": {"value": "...", "confidence": 0-100, "reasoning": "..."}
        }
        """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an AI classification expert specializing in enterprise AI initiatives."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                response_format={"type": "json_object"}
            )
            
            return {"success": True, "data": response.choices[0].message.content}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def find_similar_initiatives(self, initiative_data: Dict[str, Any], existing_initiatives: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Find similar existing initiatives to detect duplicates or opportunities for collaboration.
        
        Args:
            initiative_data: New initiative data
            existing_initiatives: List of existing initiatives
            
        Returns:
            Dictionary with similar initiatives and similarity scores
        """
        # Limit to top 20 initiatives for context window
        limited_initiatives = existing_initiatives[:20] if len(existing_initiatives) > 20 else existing_initiatives
        
        prompt = f"""
        Compare this new AI initiative against existing initiatives to find similarities:
        
        New Initiative:
        Title: {initiative_data.get('title')}
        Description: {initiative_data.get('description')}
        Business Objective: {initiative_data.get('business_objective')}
        AI Type: {initiative_data.get('ai_type')}
        Technologies: {initiative_data.get('technologies', [])}
        
        Existing Initiatives:
        {limited_initiatives}
        
        For each existing initiative, calculate similarity based on:
        - Similar business objectives
        - Overlapping technologies
        - Same AI type
        - Similar problem domain
        - Potential for collaboration or consolidation
        
        Return top 5 most similar initiatives as JSON:
        {
          "similar_initiatives": [
            {
              "id": initiative_id,
              "title": "...",
              "similarity_score": 0-100,
              "similarity_reasons": ["reason1", "reason2"],
              "recommendation": "duplicate|collaborate|consolidate|proceed"
            }
          ]
        }
        
        If no similar initiatives found, return empty array.
        """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an AI portfolio analyst specializing in identifying duplicate or overlapping initiatives."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            return {"success": True, "data": response.choices[0].message.content}
        except Exception as e:
            return {"success": False, "error": str(e)}


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
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a Portfolio Analyst specializing in AI initiative evaluation and prioritization."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                response_format={"type": "json_object"}
            )
            
            return {"success": True, "data": response.choices[0].message.content}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
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
          "alternative_scenarios": ["When to consider B instead..."]
        }}
        """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a Portfolio Analyst providing objective initiative comparisons."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                response_format={"type": "json_object"}
            )
            
            return {"success": True, "data": response.choices[0].message.content}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
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
          "rebalancing_actions": ["action1", "action2"]
        }}
        """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a Portfolio Analyst specializing in AI portfolio strategy and optimization."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.6,
                response_format={"type": "json_object"}
            )
            
            return {"success": True, "data": response.choices[0].message.content}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
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
        prompt = f"""
        Optimize this AI initiative portfolio under the given constraints:
        
        Available Initiatives ({len(initiatives)}):
        {initiatives[:10]}  # Limit for context
        
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
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a Portfolio Analyst specializing in portfolio optimization and resource allocation."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                response_format={"type": "json_object"}
            )
            
            return {"success": True, "data": response.choices[0].message.content}
        except Exception as e:
            return {"success": False, "error": str(e)}


# Singleton instance
openai_service = OpenAIService()
