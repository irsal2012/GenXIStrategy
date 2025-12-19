"""
AI Project Manager Agent - Module 7
AI-powered insights and recommendations for AI project management
"""
from typing import Dict, Any, List
from openai import OpenAI
from app.agents.base_agent import BaseAgent


class AIProjectManagerAgent(BaseAgent):
    """
    AI Project Manager Agent
    Provides AI-powered analysis and recommendations for AI project lifecycle management
    """

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
            self._log_agent_call("analyze_data_feasibility", {"business_objectives": business_objectives}, result)
            
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
            self._log_agent_call("assess_data_quality", {"dataset_name": dataset_name}, result)
            
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
            self._log_agent_call("suggest_hyperparameters", {"model_type": model_type, "algorithm": algorithm}, result)
            
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
            self._log_agent_call("interpret_model_results", {"metrics_count": len(evaluation_metrics)}, result)
            
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
            self._log_agent_call("detect_drift", {"current_metrics": len(current_metrics)}, result)
            
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
            self._log_agent_call("recommend_next_steps", {"current_phase": current_phase}, result)
            
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
            self._log_agent_call("analyze_deployment_readiness", {"model_metrics": len(model_metrics)}, result)
            
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
