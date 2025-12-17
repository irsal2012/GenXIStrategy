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


    # Module 3: Roadmap Co-Pilot Methods
    
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
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a Roadmap Co-Pilot specializing in AI initiative sequencing and dependency management."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                response_format={"type": "json_object"}
            )
            
            return {"success": True, "data": response.choices[0].message.content}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
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
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a Roadmap Co-Pilot specializing in bottleneck detection and resolution."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                response_format={"type": "json_object"}
            )
            
            return {"success": True, "data": response.choices[0].message.content}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
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
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a Roadmap Co-Pilot specializing in timeline estimation and risk assessment."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                response_format={"type": "json_object"}
            )
            
            return {"success": True, "data": response.choices[0].message.content}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
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
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a Roadmap Co-Pilot specializing in dependency resolution and unblocking initiatives."},
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
