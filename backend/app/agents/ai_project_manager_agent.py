"""
AI Project Manager Agent - Module 7
AI-powered insights and recommendations for AI project management
Enhanced with PMI-CPMAI pattern classification and initiative matching
"""
from typing import Dict, Any, List
import json
from openai import OpenAI
from app.agents.base_agent import BaseAgent


def _extract_json_from_text(text: str) -> dict:
    """Best-effort JSON extraction when the model returns JSON wrapped in prose/markdown."""
    text = (text or "").strip()
    if not text:
        raise ValueError("Empty response from model")

    # Fast-path
    try:
        return json.loads(text)
    except Exception:
        pass

    # Strip markdown fences
    if "```" in text:
        parts = [p.strip() for p in text.split("```") if p.strip()]
        # Prefer parts that look like JSON
        for p in parts:
            candidate = p
            if candidate.lower().startswith("json"):
                candidate = candidate[4:].strip()
            try:
                return json.loads(candidate)
            except Exception:
                continue

    # Fallback: grab first top-level JSON object substring
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = text[start : end + 1]
        return json.loads(candidate)

    raise ValueError("Failed to parse JSON from model response")


class AIProjectManagerAgent(BaseAgent):
    """
    AI Project Manager Agent
    Provides AI-powered analysis and recommendations for AI project lifecycle management
    Enhanced with PMI-CPMAI workflow support
    """

    # PMI-CPMAI Seven Patterns
    PMI_PATTERNS = [
        "Hyperpersonalization",
        "Conversational & Human Interaction",
        "Recognition",
        "Pattern & Anomaly Detection",
        "Predictive Analytics & Decision Support",
        "Goal-Driven Systems",
        "Autonomous Systems"
    ]

    async def classify_ai_pattern(
        self,
        business_problem: str
    ) -> Dict[str, Any]:
        """
        Classify business problem into one of PMI's 7 AI patterns.
        
        Args:
            business_problem: Description of the business problem
            
        Returns:
            Dict with pattern classification, confidence, and reasoning
        """
        prompt = f"""
You are an AI Project Manager expert in PMI-CPMAI (Certified Professional in Machine Learning and Artificial Intelligence).

Analyze the following business problem and classify it into ONE of the seven PMI AI patterns:

1. **Hyperpersonalization**: Uses machine learning to build and continually refine unique profiles for individuals so systems can tailor experiences, recommendations, or interactions specifically to each person.

2. **Conversational & Human Interaction**: Enables natural communication between humans and machines (voice, text, etc.), including chatbots, assistants, translation, summarization, and generative content creation.

3. **Recognition**: Lets AI perceive and interpret unstructured sensory data — e.g., images, audio, handwriting, text — and convert it into structured information for action or analysis.

4. **Pattern & Anomaly Detection**: Learns what "normal" looks like in data and identifies structure, outliers, correlations, or unusual behavior — widely used in fraud detection, quality control, and risk monitoring.

5. **Predictive Analytics & Decision Support**: Forecasts future outcomes, trends, or risks based on historical and real-time data to inform human decision-making.

6. **Goal-Driven Systems**: Uses feedback and optimization (e.g., reinforcement learning) to pursue defined goals by learning strategies that maximize reward through trial and error.

7. **Autonomous Systems**: AI agents that perceive, decide, and act toward goals with minimal human intervention — from self-driving vehicles to autonomous robots or intelligent software agents.

Business Problem:
{business_problem}

Analyze this problem and respond in JSON format:
{{
    "primary_pattern": "<exact pattern name from list above>",
    "confidence": <0.0-1.0>,
    "reasoning": "<detailed explanation of why this pattern fits>",
    "secondary_patterns": ["<pattern name>", ...],
    "key_indicators": ["indicator1", "indicator2"],
    "use_case_examples": ["example1", "example2"]
}}
"""
        
        try:
            # Prefer strict JSON mode when supported by the configured model.
            api_params = {
                "model": self.model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2,
            }

            # Some models (or older OpenAI library combos) can error on response_format.
            # We try strict JSON first, then fall back to plain text + robust parsing.
            try:
                response = self.client.chat.completions.create(
                    **api_params,
                    response_format={"type": "json_object"}
                )
            except Exception:
                response = self.client.chat.completions.create(**api_params)

            content = response.choices[0].message.content
            result = _extract_json_from_text(content)

            return {
                "success": True,
                "data": result,
                "agent": self.agent_name,
                "message": "AI pattern classification completed"
            }
        except Exception as e:
            return self._handle_error(e)

    async def generate_tactical_use_cases(
        self,
        business_problem: str,
        ai_pattern: str,
        initiative_details: Dict[str, Any],
        pattern_examples: List[str]
    ) -> Dict[str, Any]:
        """
        Generate 3-5 tactical use cases for a specific business problem within an initiative.
        
        Args:
            business_problem: User's specific business problem
            ai_pattern: Selected AI pattern
            initiative_details: Details of the selected initiative
            pattern_examples: Example use cases for the AI pattern
            
        Returns:
            Dict with 3-5 tactical use cases
        """
        prompt = f"""
You are an AI Project Strategist helping define tactical use cases for an AI initiative.

CONTEXT:
Business Problem: {business_problem}

AI Pattern: {ai_pattern}
Pattern Examples: {', '.join(pattern_examples)}

Strategic Initiative: {initiative_details.get('title', 'N/A')}
Initiative Description: {initiative_details.get('description', 'N/A')}
Initiative Objective: {initiative_details.get('business_objective', 'N/A')}

TASK:
Generate 3-5 tactical use cases that are:
1. Specific implementations within the strategic initiative
2. Directly address the user's business problem
3. Scoped for 3-6 month implementation
4. Measurable with clear success criteria
5. Aligned with the AI pattern capabilities

Each tactical use case should be a concrete, implementable project that:
- Has a clear title and description
- Defines expected outcomes
- Specifies timeline and complexity
- Includes measurable success criteria
- Shows high alignment with the business problem

Respond in JSON format:
{{
    "use_cases": [
        {{
            "title": "Short, descriptive title (max 60 chars)",
            "description": "What this use case accomplishes and how it addresses the business problem (2-3 sentences)",
            "expected_outcomes": [
                "Specific, measurable outcome 1",
                "Specific, measurable outcome 2",
                "Specific, measurable outcome 3"
            ],
            "timeline": "3-6 months",
            "success_criteria": [
                "Measurable criterion 1 (e.g., 'Achieve 85% accuracy')",
                "Measurable criterion 2 (e.g., 'Reduce churn by 15%')"
            ],
            "alignment_score": <75-95>,
            "implementation_complexity": "low|medium|high",
            "key_technologies": ["technology1", "technology2"],
            "estimated_roi": "Brief ROI description"
        }}
    ]
}}

Generate 3-5 use cases, ordered by alignment score (highest first).
"""
        
        try:
            api_params = {
                "model": self.model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.4,
            }

            try:
                response = self.client.chat.completions.create(
                    **api_params,
                    response_format={"type": "json_object"}
                )
            except Exception:
                response = self.client.chat.completions.create(**api_params)

            content = response.choices[0].message.content
            result = _extract_json_from_text(content)

            # Basic shape validation to avoid downstream UI crashes
            if not isinstance(result, dict) or "use_cases" not in result or not isinstance(result.get("use_cases"), list):
                raise ValueError("Model response missing required 'use_cases' list")

            return {
                "success": True,
                "data": result,
                "agent": self.agent_name,
                "message": "Tactical use cases generated successfully"
            }
        except Exception as e:
            return self._handle_error(e)

    async def recommend_best_initiative(
        self,
        business_problem: str,
        ai_pattern: str,
        similar_initiatives: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Recommend the best matching initiative from similar initiatives.
        
        Args:
            business_problem: Original business problem description
            ai_pattern: Classified AI pattern
            similar_initiatives: List of similar initiatives with similarity scores
            
        Returns:
            Dict with recommendation, reasoning, and ranked alternatives
        """
        if not similar_initiatives:
            return self._format_success_response(
                data={
                    "recommended_initiative_id": None,
                    "confidence": 0.0,
                    "reasoning": "No similar initiatives found in the system.",
                    "ranked_alternatives": []
                },
                message="No initiatives to recommend"
            )
        
        # Format initiatives for prompt
        initiatives_text = "\n\n".join([
            f"Initiative #{init['initiative_id']}:\n"
            f"- Title: {init['title']}\n"
            f"- Description: {init['description']}\n"
            f"- Business Objective: {init.get('business_objective', 'N/A')}\n"
            f"- AI Pattern: {init.get('ai_pattern', 'N/A')}\n"
            f"- Status: {init.get('status', 'N/A')}\n"
            f"- Similarity Score: {init['similarity_percentage']}%"
            for init in similar_initiatives[:10]  # Top 10
        ])
        
        prompt = f"""
You are an AI Project Manager helping match a business problem to the best existing initiative.

Business Problem:
{business_problem}

Classified AI Pattern: {ai_pattern}

Similar Initiatives Found:
{initiatives_text}

Analyze these initiatives and recommend the BEST match. Consider:
1. Semantic similarity score
2. AI pattern alignment
3. Business objective alignment
4. Initiative status (prefer 'ideation' or 'planning' over completed)
5. Potential for reuse or extension

Respond in JSON format:
{{
    "recommended_initiative_id": <initiative_id>,
    "confidence": <0.0-1.0>,
    "reasoning": "<detailed explanation of why this is the best match>",
    "alignment_factors": [
        {{"factor": "...", "score": <0-100>, "explanation": "..."}}
    ],
    "ranked_alternatives": [
        {{"initiative_id": <id>, "rank": 1, "reason": "..."}}
    ],
    "concerns": ["concern1", "concern2"],
    "recommendations": ["recommendation1", "recommendation2"]
}}
"""
        
        try:
            api_params = {
                "model": self.model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3,
            }

            try:
                response = self.client.chat.completions.create(
                    **api_params,
                    response_format={"type": "json_object"}
                )
            except Exception:
                response = self.client.chat.completions.create(**api_params)

            content = response.choices[0].message.content
            result = _extract_json_from_text(content)

            return {
                "success": True,
                "data": result,
                "agent": self.agent_name,
                "message": "Initiative recommendation completed"
            }
        except Exception as e:
            return self._handle_error(e)

    async def analyze_data_feasibility(
        self,
        business_objectives: str,
        data_sources: List[Dict[str, Any]],
        compliance_requirements: List[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze data feasibility for an AI initiative
        Assesses whether required data is available and suitable
        """
        prompt = f"""
You are an AI Project Manager analyzing data feasibility for a new AI initiative.

Business Objectives:
{business_objectives}

Identified Data Sources:
{self._format_data_sources(data_sources)}

Compliance Requirements:
{', '.join(compliance_requirements) if compliance_requirements else 'None specified'}

Analyze the data feasibility and provide:
1. Feasibility score (0-100)
2. Overall recommendation (GO/NO-GO/CONDITIONAL)
3. Data availability assessment for each source
4. Compliance risks identified
5. Estimated timeline to data readiness
6. Key concerns and mitigation strategies

Respond in JSON format:
{{
    "feasibility_score": <0-100>,
    "recommendation": "<GO|NO-GO|CONDITIONAL>",
    "data_availability_assessment": {{
        "source_name": {{"available": true/false, "quality": "high/medium/low", "concerns": "..."}}
    }},
    "compliance_risks": [
        {{"risk": "...", "severity": "high/medium/low", "mitigation": "..."}}
    ],
    "estimated_timeline": "<timeline description>",
    "key_concerns": ["concern1", "concern2"],
    "confidence": <0.0-1.0>
}}
"""
        
        try:
            response = await self._call_openai(
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            result = self._parse_json_response(response)
            self._log_agent_call("analyze_data_feasibility", True, "Data feasibility analysis completed")
            
            return self._format_success_response(
                data=result,
                message="Data feasibility analysis completed"
            )
        except Exception as e:
            return self._handle_error(e)

    async def assess_data_quality(
        self,
        dataset_name: str,
        profiling_results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Assess data quality and provide recommendations
        """
        prompt = f"""
You are an AI Project Manager assessing data quality for an AI project.

Dataset: {dataset_name}

Data Profiling Results:
{self._format_profiling_results(profiling_results)}

Analyze the data quality and provide:
1. Overall quality score (0-100)
2. Issues identified (missing values, duplicates, outliers, etc.)
3. Recommendations for data cleaning
4. Priority actions to improve quality
5. Impact assessment on model development

Respond in JSON format:
{{
    "quality_score": <0-100>,
    "issues_identified": [
        {{"issue": "...", "severity": "high/medium/low", "affected_features": ["..."], "impact": "..."}}
    ],
    "recommendations": ["recommendation1", "recommendation2"],
    "priority_actions": ["action1", "action2"],
    "estimated_effort": "<effort description>",
    "confidence": <0.0-1.0>
}}
"""
        
        try:
            response = await self._call_openai(
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            result = self._parse_json_response(response)
            self._log_agent_call("assess_data_quality", True, "Data quality assessment completed")
            
            return self._format_success_response(
                data=result,
                message="Data quality assessment completed"
            )
        except Exception as e:
            return self._handle_error(e)

    async def suggest_hyperparameters(
        self,
        model_type: str,
        algorithm: str,
        dataset_characteristics: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Suggest optimal hyperparameters for model training
        """
        prompt = f"""
You are an AI Project Manager suggesting hyperparameters for model training.

Model Type: {model_type}
Algorithm: {algorithm}

Dataset Characteristics:
{self._format_dataset_characteristics(dataset_characteristics)}

Suggest optimal hyperparameters and provide:
1. Recommended hyperparameter values
2. Rationale for each suggestion
3. Expected performance range
4. Alternative configurations to try
5. Training tips

Respond in JSON format:
{{
    "suggested_hyperparameters": {{
        "param_name": {{"value": "...", "rationale": "..."}}
    }},
    "expected_performance_range": {{
        "min": <value>,
        "max": <value>,
        "metric": "<metric_name>"
    }},
    "alternative_configs": [
        {{"name": "...", "hyperparameters": {{}}, "use_case": "..."}}
    ],
    "training_tips": ["tip1", "tip2"],
    "confidence": <0.0-1.0>
}}
"""
        
        try:
            response = await self._call_openai(
                messages=[{"role": "user", "content": prompt}],
                temperature=0.4
            )
            
            result = self._parse_json_response(response)
            self._log_agent_call("suggest_hyperparameters", True, "Hyperparameter suggestions generated")
            
            return self._format_success_response(
                data=result,
                message="Hyperparameter suggestions generated"
            )
        except Exception as e:
            return self._handle_error(e)

    async def interpret_model_results(
        self,
        evaluation_metrics: Dict[str, Any],
        feature_importance: Dict[str, float] = None
    ) -> Dict[str, Any]:
        """
        Interpret model evaluation results and provide insights
        """
        prompt = f"""
You are an AI Project Manager interpreting model evaluation results.

Evaluation Metrics:
{self._format_metrics(evaluation_metrics)}

Feature Importance:
{self._format_feature_importance(feature_importance) if feature_importance else 'Not provided'}

Interpret the results and provide:
1. Overall interpretation of model performance
2. Key insights from the metrics
3. Strengths of the model
4. Weaknesses and areas for improvement
5. Recommendations for next steps
6. Production readiness assessment

Respond in JSON format:
{{
    "interpretation": "<overall interpretation>",
    "key_insights": ["insight1", "insight2"],
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "recommendations": ["recommendation1", "recommendation2"],
    "production_ready": true/false,
    "production_readiness_score": <0-100>,
    "confidence": <0.0-1.0>
}}
"""
        
        try:
            response = await self._call_openai(
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            result = self._parse_json_response(response)
            self._log_agent_call("interpret_model_results", True, "Model interpretation completed")
            
            return self._format_success_response(
                data=result,
                message="Model interpretation completed"
            )
        except Exception as e:
            return self._handle_error(e)

    async def detect_drift(
        self,
        current_metrics: Dict[str, Any],
        historical_metrics: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Detect data or model drift in production
        """
        prompt = f"""
You are an AI Project Manager analyzing model drift in production.

Current Metrics:
{self._format_metrics(current_metrics)}

Historical Metrics (last {len(historical_metrics)} periods):
{self._format_historical_metrics(historical_metrics)}

Analyze for drift and provide:
1. Whether drift is detected
2. Type of drift (data drift, model drift, concept drift)
3. Drift score (0-100)
4. Affected features or metrics
5. Recommendations for addressing drift
6. Urgency level

Respond in JSON format:
{{
    "drift_detected": true/false,
    "drift_type": "<data_drift|model_drift|concept_drift>",
    "drift_score": <0-100>,
    "affected_features": ["feature1", "feature2"],
    "affected_metrics": ["metric1", "metric2"],
    "recommendations": ["recommendation1", "recommendation2"],
    "urgency": "<low|medium|high|critical>",
    "suggested_actions": ["action1", "action2"],
    "confidence": <0.0-1.0>
}}
"""
        
        try:
            response = await self._call_openai(
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            result = self._parse_json_response(response)
            self._log_agent_call("detect_drift", True, "Drift detection completed")
            
            return self._format_success_response(
                data=result,
                message="Drift detection completed"
            )
        except Exception as e:
            return self._handle_error(e)

    async def recommend_next_steps(
        self,
        current_phase: str,
        phase_status: Dict[str, Any],
        blockers: List[str] = None
    ) -> Dict[str, Any]:
        """
        Recommend next steps based on current project phase and status
        """
        prompt = f"""
You are an AI Project Manager recommending next steps for an AI project.

Current Phase: {current_phase}

Phase Status:
{self._format_phase_status(phase_status)}

Blockers:
{', '.join(blockers) if blockers else 'None'}

Recommend next steps and provide:
1. Immediate actions to take
2. Priority order
3. Estimated effort for each action
4. Dependencies and prerequisites
5. Risk mitigation strategies
6. Success criteria

Respond in JSON format:
{{
    "immediate_actions": [
        {{"action": "...", "priority": "high/medium/low", "effort": "...", "owner": "..."}}
    ],
    "dependencies": ["dependency1", "dependency2"],
    "risk_mitigation": [
        {{"risk": "...", "mitigation": "..."}}
    ],
    "success_criteria": ["criteria1", "criteria2"],
    "estimated_timeline": "<timeline>",
    "confidence": <0.0-1.0>
}}
"""
        
        try:
            response = await self._call_openai(
                messages=[{"role": "user", "content": prompt}],
                temperature=0.4
            )
            
            result = self._parse_json_response(response)
            self._log_agent_call("recommend_next_steps", True, "Next steps recommendations generated")
            
            return self._format_success_response(
                data=result,
                message="Next steps recommendations generated"
            )
        except Exception as e:
            return self._handle_error(e)

    async def analyze_deployment_readiness(
        self,
        model_metrics: Dict[str, Any],
        infrastructure_details: Dict[str, Any],
        business_requirements: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze whether a model is ready for production deployment
        """
        prompt = f"""
You are an AI Project Manager assessing deployment readiness.

Model Metrics:
{self._format_metrics(model_metrics)}

Infrastructure Details:
{self._format_infrastructure(infrastructure_details)}

Business Requirements:
{self._format_business_requirements(business_requirements)}

Assess deployment readiness and provide:
1. Overall readiness score (0-100)
2. Readiness assessment by category (model, infrastructure, business)
3. Blockers to deployment
4. Recommendations before deployment
5. Risk assessment
6. Go/No-Go recommendation

Respond in JSON format:
{{
    "readiness_score": <0-100>,
    "category_scores": {{
        "model_readiness": <0-100>,
        "infrastructure_readiness": <0-100>,
        "business_readiness": <0-100>
    }},
    "blockers": ["blocker1", "blocker2"],
    "recommendations": ["recommendation1", "recommendation2"],
    "risks": [
        {{"risk": "...", "severity": "high/medium/low", "mitigation": "..."}}
    ],
    "go_no_go": "<GO|NO-GO|CONDITIONAL>",
    "confidence": <0.0-1.0>
}}
"""
        
        try:
            response = await self._call_openai(
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            result = self._parse_json_response(response)
            self._log_agent_call("analyze_deployment_readiness", True, "Deployment readiness analysis completed")
            
            return self._format_success_response(
                data=result,
                message="Deployment readiness analysis completed"
            )
        except Exception as e:
            return self._handle_error(e)

    # Helper methods for formatting
    
    def _format_data_sources(self, data_sources: List[Dict[str, Any]]) -> str:
        """Format data sources for prompt"""
        if not data_sources:
            return "No data sources specified"
        
        formatted = []
        for source in data_sources:
            formatted.append(f"- {source.get('name', 'Unknown')}: {source.get('description', 'No description')}")
        return "\n".join(formatted)

    def _format_profiling_results(self, profiling: Dict[str, Any]) -> str:
        """Format profiling results for prompt"""
        return "\n".join([f"- {k}: {v}" for k, v in profiling.items()])

    def _format_dataset_characteristics(self, characteristics: Dict[str, Any]) -> str:
        """Format dataset characteristics for prompt"""
        return "\n".join([f"- {k}: {v}" for k, v in characteristics.items()])

    def _format_metrics(self, metrics: Dict[str, Any]) -> str:
        """Format metrics for prompt"""
        return "\n".join([f"- {k}: {v}" for k, v in metrics.items()])

    def _format_feature_importance(self, importance: Dict[str, float]) -> str:
        """Format feature importance for prompt"""
        sorted_features = sorted(importance.items(), key=lambda x: x[1], reverse=True)
        return "\n".join([f"- {k}: {v:.4f}" for k, v in sorted_features[:10]])

    def _format_historical_metrics(self, historical: List[Dict[str, Any]]) -> str:
        """Format historical metrics for prompt"""
        formatted = []
        for i, metrics in enumerate(historical[-5:]):  # Last 5 periods
            formatted.append(f"Period {i+1}: {metrics}")
        return "\n".join(formatted)

    def _format_phase_status(self, status: Dict[str, Any]) -> str:
        """Format phase status for prompt"""
        return "\n".join([f"- {k}: {v}" for k, v in status.items()])

    def _format_infrastructure(self, infrastructure: Dict[str, Any]) -> str:
        """Format infrastructure details for prompt"""
        return "\n".join([f"- {k}: {v}" for k, v in infrastructure.items()])

    def _format_business_requirements(self, requirements: Dict[str, Any]) -> str:
        """Format business requirements for prompt"""
        return "\n".join([f"- {k}: {v}" for k, v in requirements.items()])
