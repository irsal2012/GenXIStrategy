"""
Governance Agent

Module 4: Compliance checks (NEVER auto-approves)

Responsibilities:
- Check compliance completeness
- Map applicable regulations
- Draft risk statements
- Recommend risk controls
- Generate model cards

Guardrails:
- CRITICAL: Explicit "human approval required" in all responses
- Never auto-approve initiatives
- Recommendations only, no decisions
- Source-linked explanations
"""

from typing import Dict, Any, List, Optional
from .base_agent import BaseAgent


class GovernanceAgent(BaseAgent):
    """
    Governance Agent for compliance and risk management.
    
    CRITICAL: This agent NEVER auto-approves. All recommendations
    require human review and approval.
    """
    
    async def check_compliance_completeness(
        self, 
        initiative_data: Dict[str, Any],
        evidence_documents: List[Dict[str, Any]],
        risk_tier: str
    ) -> Dict[str, Any]:
        """
        Compliance Agent: Check completeness of governance artifacts and flag missing items.
        IMPORTANT: This agent NEVER auto-approves - it only provides recommendations.
        
        Args:
            initiative_data: Initiative details
            evidence_documents: List of uploaded evidence documents
            risk_tier: Risk tier (low, medium, high)
            
        Returns:
            Dictionary with completeness assessment and missing artifacts
        """
        prompt = f"""
        As a Compliance Agent, assess the completeness of governance artifacts for this AI initiative:
        
        Initiative:
        Title: {initiative_data.get('title')}
        Description: {initiative_data.get('description')}
        AI Type: {initiative_data.get('ai_type')}
        Risk Tier: {risk_tier}
        Strategic Domain: {initiative_data.get('strategic_domain')}
        Data Sources: {initiative_data.get('data_sources', [])}
        
        Submitted Evidence Documents:
        {evidence_documents}
        
        Required Artifacts by Risk Tier:
        
        LOW RISK:
        - Business Case Document
        - Data Source Inventory
        - Stakeholder Sign-off
        
        MEDIUM RISK (includes all low risk +):
        - Model Card
        - Data Privacy Impact Assessment (DPIA)
        - Bias Testing Report
        - Model Monitoring Plan
        
        HIGH RISK (includes all medium risk +):
        - Fairness Metrics Report
        - Explainability Documentation
        - Third-Party Audit Report (if applicable)
        - Regulatory Compliance Checklist
        - Incident Response Plan
        
        Assess:
        1. Completeness score (0-100)
        2. Missing required artifacts
        3. Incomplete or inadequate artifacts
        4. Quality assessment of submitted artifacts
        5. Recommendations for improvement
        
        IMPORTANT: You are providing recommendations only. You CANNOT and MUST NOT approve this initiative.
        All approvals require human decision-making.
        
        Return as JSON:
        {{
          "completeness_score": 75,
          "status": "incomplete",
          "missing_artifacts": [
            {{
              "artifact": "Model Card",
              "required_for": "medium_risk",
              "importance": "critical",
              "description": "Detailed model documentation required",
              "guidance": "Follow Google's Model Card template"
            }}
          ],
          "incomplete_artifacts": [
            {{
              "artifact": "DPIA",
              "issue": "Missing risk mitigation section",
              "recommendation": "Add detailed mitigation strategies"
            }}
          ],
          "quality_assessment": {{
            "business_case": {{"score": 8, "feedback": "Well documented"}},
            "data_inventory": {{"score": 6, "feedback": "Missing data lineage"}}
          }},
          "recommendations": [
            "Complete Model Card using standard template",
            "Enhance DPIA with mitigation strategies",
            "Add bias testing results"
          ],
          "next_steps": ["action1", "action2"],
          "estimated_time_to_complete": "2 weeks",
          "ai_note": "IMPORTANT: This is a recommendation only. Human approval is required."
        }}
        """
        
        system_message = "You are a Compliance Agent specializing in AI governance. You provide recommendations but NEVER approve initiatives. All approvals require human decision-making."
        
        result = await self._call_openai(
            prompt=prompt,
            system_message=system_message,
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        return result
    
    async def map_regulations(
        self, 
        initiative_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Compliance Agent: Map initiative to applicable regulations and requirements.
        
        Args:
            initiative_data: Initiative details
            
        Returns:
            Dictionary with applicable regulations and specific requirements
        """
        prompt = f"""
        As a Compliance Agent, identify all applicable regulations for this AI initiative:
        
        Initiative:
        Title: {initiative_data.get('title')}
        Description: {initiative_data.get('description')}
        AI Type: {initiative_data.get('ai_type')}
        Strategic Domain: {initiative_data.get('strategic_domain')}
        Business Function: {initiative_data.get('business_function')}
        Data Sources: {initiative_data.get('data_sources', [])}
        Geographic Scope: {initiative_data.get('geographic_scope', 'Global')}
        Industry: {initiative_data.get('industry', 'General')}
        
        Identify applicable regulations from:
        
        GENERAL AI REGULATIONS:
        - EU AI Act (risk-based approach)
        - NIST AI Risk Management Framework
        - ISO/IEC 42001 (AI Management System)
        
        DATA PRIVACY:
        - GDPR (EU)
        - CCPA/CPRA (California)
        - LGPD (Brazil)
        - PIPEDA (Canada)
        
        INDUSTRY-SPECIFIC:
        - HIPAA (Healthcare)
        - GLBA (Financial Services)
        - FERPA (Education)
        - SR 11-7 (Banking - Model Risk Management)
        - FDA Guidance (Medical AI)
        
        EMPLOYMENT/HR:
        - EEOC Guidelines (US)
        - NYC Local Law 144 (Automated Employment Decision Tools)
        
        For each applicable regulation, provide:
        - Regulation name and jurisdiction
        - Why it applies to this initiative
        - Specific requirements
        - Compliance actions needed
        - Risk level if non-compliant
        - Recommended evidence/documentation
        
        Return as JSON:
        {{
          "applicable_regulations": [
            {{
              "regulation": "EU AI Act",
              "jurisdiction": "European Union",
              "risk_classification": "High-Risk AI System",
              "why_applicable": "Uses personal data for automated decision-making",
              "specific_requirements": [
                "Risk management system",
                "Data governance",
                "Technical documentation",
                "Human oversight",
                "Accuracy, robustness, cybersecurity"
              ],
              "compliance_actions": [
                "Conduct conformity assessment",
                "Register in EU database",
                "Implement human oversight mechanisms"
              ],
              "non_compliance_risk": "critical",
              "penalties": "Up to €30M or 6% of global turnover",
              "required_evidence": ["Technical documentation", "Risk assessment", "Conformity assessment"]
            }}
          ],
          "compliance_priority": "high",
          "estimated_compliance_effort": "3-6 months",
          "recommended_next_steps": ["step1", "step2"],
          "external_expertise_needed": ["Legal counsel", "Privacy officer"],
          "confidence": 85
        }}
        """
        
        system_message = "You are a Compliance Agent specializing in global AI regulations and data privacy laws."
        
        result = await self._call_openai(
            prompt=prompt,
            system_message=system_message,
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        return result
    
    async def draft_risk_statement(
        self, 
        risk_data: Dict[str, Any],
        initiative_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Risk Advisor Agent: Draft clear, actionable risk statements.
        IMPORTANT: This agent NEVER auto-approves - recommendations require human review.
        
        Args:
            risk_data: Preliminary risk information
            initiative_data: Initiative context
            
        Returns:
            Dictionary with drafted risk statements and recommendations
        """
        prompt = f"""
        As a Risk Advisor Agent, draft clear and actionable risk statements for this AI initiative:
        
        Initiative Context:
        Title: {initiative_data.get('title')}
        Description: {initiative_data.get('description')}
        AI Type: {initiative_data.get('ai_type')}
        
        Preliminary Risk Information:
        Category: {risk_data.get('category')}
        Initial Description: {risk_data.get('description')}
        Severity: {risk_data.get('severity')}
        
        Draft comprehensive risk statements following best practices:
        
        1. RISK STATEMENT FORMAT:
           "There is a risk that [event] will occur, caused by [cause], resulting in [impact]"
        
        2. Include:
           - Clear description of the risk event
           - Root causes
           - Potential impacts (business, technical, reputational, regulatory)
           - Likelihood assessment (1-5)
           - Impact assessment (1-5)
           - Risk score (likelihood × impact)
        
        3. Provide:
           - Primary risk statement
           - Alternative phrasings
           - Related risks to consider
           - Risk indicators/triggers
        
        IMPORTANT: You are providing risk analysis only. You CANNOT and MUST NOT approve risk acceptance.
        All risk acceptance decisions require human approval.
        
        Return as JSON:
        {{
          "primary_risk_statement": "There is a risk that the model will produce biased outcomes against protected groups, caused by historical bias in training data, resulting in discriminatory decisions, regulatory violations, and reputational damage.",
          "alternative_statements": [
            "Alternative phrasing 1...",
            "Alternative phrasing 2..."
          ],
          "risk_details": {{
            "event": "Model produces biased outcomes",
            "causes": ["Historical bias in data", "Lack of diverse training data", "Proxy variables"],
            "impacts": [
              {{"type": "regulatory", "description": "EEOC violations", "severity": "critical"}},
              {{"type": "reputational", "description": "Brand damage", "severity": "high"}},
              {{"type": "business", "description": "Lost customers", "severity": "medium"}}
            ],
            "likelihood": 4,
            "impact": 5,
            "risk_score": 20
          }},
          "related_risks": [
            "Lack of model explainability",
            "Insufficient bias testing",
            "Inadequate monitoring"
          ],
          "risk_indicators": [
            "Disparate impact ratios > 0.8",
            "Complaints from affected groups",
            "Audit findings"
          ],
          "ai_note": "IMPORTANT: This is risk analysis only. Human approval required for risk acceptance."
        }}
        """
        
        system_message = "You are a Risk Advisor Agent specializing in AI risk management. You provide risk analysis but NEVER approve risk acceptance. All risk decisions require human approval."
        
        result = await self._call_openai(
            prompt=prompt,
            system_message=system_message,
            temperature=0.4,
            response_format={"type": "json_object"}
        )
        
        return result
    
    async def recommend_risk_controls(
        self, 
        risk_data: Dict[str, Any],
        initiative_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Risk Advisor Agent: Recommend mitigation controls for identified risks.
        IMPORTANT: Recommendations require human approval before implementation.
        
        Args:
            risk_data: Risk details
            initiative_data: Initiative context
            
        Returns:
            Dictionary with recommended controls and mitigation strategies
        """
        prompt = f"""
        As a Risk Advisor Agent, recommend mitigation controls for this identified risk:
        
        Risk:
        Title: {risk_data.get('title')}
        Description: {risk_data.get('description')}
        Category: {risk_data.get('category')}
        Severity: {risk_data.get('severity')}
        Likelihood: {risk_data.get('likelihood')}
        Impact: {risk_data.get('impact')}
        Risk Score: {risk_data.get('risk_score')}
        
        Initiative Context:
        Title: {initiative_data.get('title')}
        AI Type: {initiative_data.get('ai_type')}
        Technologies: {initiative_data.get('technologies', [])}
        
        Recommend mitigation controls following the three-lines-of-defense model:
        
        1. PREVENTIVE CONTROLS (prevent risk from occurring):
           - Design controls
           - Process controls
           - Technical controls
        
        2. DETECTIVE CONTROLS (detect when risk occurs):
           - Monitoring controls
           - Testing controls
           - Audit controls
        
        3. CORRECTIVE CONTROLS (correct after risk occurs):
           - Response procedures
           - Remediation plans
           - Recovery mechanisms
        
        For each control, provide:
        - Control name
        - Control type (preventive/detective/corrective)
        - Description
        - Implementation effort (low/medium/high)
        - Effectiveness (low/medium/high)
        - Owner role
        - Implementation timeline
        - Verification method
        
        IMPORTANT: These are recommendations only. Human approval required before implementation.
        
        Return as JSON:
        {{
          "recommended_controls": [
            {{
              "control_name": "Bias Testing Framework",
              "control_type": "preventive",
              "description": "Implement comprehensive bias testing across protected attributes",
              "implementation_steps": ["step1", "step2", "step3"],
              "effort": "medium",
              "effectiveness": "high",
              "owner_role": "ML Engineer",
              "timeline": "4 weeks",
              "cost_estimate": "$50,000",
              "verification_method": "Quarterly bias audits",
              "dependencies": ["Test data availability", "Fairness metrics defined"]
            }}
          ],
          "mitigation_strategy": {{
            "approach": "Layered defense with preventive, detective, and corrective controls",
            "residual_risk": "low",
            "residual_risk_score": 6,
            "risk_reduction": 70
          }},
          "implementation_priority": [
            {{"control": "Bias Testing Framework", "priority": 1, "rationale": "..."}},
            {{"control": "Monitoring Dashboard", "priority": 2, "rationale": "..."}}
          ],
          "alternative_approaches": [
            {{"approach": "Third-party audit", "pros": ["..."], "cons": ["..."], "cost": "$100,000"}}
          ],
          "estimated_total_cost": "$150,000",
          "estimated_timeline": "3 months",
          "ai_note": "IMPORTANT: These are recommendations only. Human approval required for implementation."
        }}
        """
        
        system_message = "You are a Risk Advisor Agent specializing in AI risk mitigation. You provide recommendations but NEVER approve implementations. All decisions require human approval."
        
        result = await self._call_openai(
            prompt=prompt,
            system_message=system_message,
            temperature=0.5,
            response_format={"type": "json_object"}
        )
        
        return result
    
    async def generate_model_card(
        self, 
        initiative_data: Dict[str, Any],
        model_details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate a model card template following Google's Model Card framework.
        
        Args:
            initiative_data: Initiative details
            model_details: Optional model-specific details
            
        Returns:
            Dictionary with model card template and pre-filled sections
        """
        prompt = f"""
        Generate a Model Card template following Google's Model Card framework for this AI initiative:
        
        Initiative:
        Title: {initiative_data.get('title')}
        Description: {initiative_data.get('description')}
        AI Type: {initiative_data.get('ai_type')}
        Business Objective: {initiative_data.get('business_objective')}
        Technologies: {initiative_data.get('technologies', [])}
        
        Model Details (if available):
        {model_details or "To be filled by model developers"}
        
        Generate a comprehensive Model Card with the following sections:
        
        1. MODEL DETAILS
           - Model name, version, type
           - Developers, date
           - License, citation
        
        2. INTENDED USE
           - Primary use cases
           - Out-of-scope uses
           - Target users
        
        3. FACTORS
           - Relevant factors (demographics, environment, etc.)
           - Evaluation factors
        
        4. METRICS
           - Performance metrics
           - Decision thresholds
           - Fairness metrics
        
        5. TRAINING DATA
           - Datasets used
           - Preprocessing
           - Data splits
        
        6. EVALUATION DATA
           - Datasets
           - Preprocessing
           - Motivation
        
        7. QUANTITATIVE ANALYSES
           - Performance results
           - Disaggregated results
        
        8. ETHICAL CONSIDERATIONS
           - Bias risks
           - Fairness assessment
           - Privacy considerations
        
        9. CAVEATS AND RECOMMENDATIONS
           - Known limitations
           - Recommendations for use
        
        Pre-fill sections where information is available from initiative data.
        Mark sections that require model developer input.
        
        Return as JSON:
        {{
          "model_card": {{
            "model_details": {{
              "name": "Customer Churn Prediction Model",
              "version": "1.0",
              "type": "Binary Classification",
              "developers": "To be filled",
              "date": "To be filled",
              "license": "To be filled"
            }},
            "intended_use": {{
              "primary_use_cases": ["Predict customer churn risk", "Prioritize retention efforts"],
              "out_of_scope": ["Individual customer decisions", "Automated account closure"],
              "target_users": ["Customer success teams", "Marketing teams"]
            }},
            ...
          }},
          "pre_filled_sections": ["intended_use", "ethical_considerations"],
          "required_sections": ["model_details", "training_data", "quantitative_analyses"],
          "suggested_metrics": [
            "Accuracy",
            "Precision/Recall",
            "AUC-ROC",
            "Demographic parity",
            "Equal opportunity"
          ],
          "guidance": {{
            "training_data": "Document all datasets used, including source, size, and preprocessing steps",
            "quantitative_analyses": "Include disaggregated performance metrics by demographic groups"
          }},
          "estimated_completion_time": "2-3 weeks"
        }}
        """
        
        system_message = "You are an AI documentation specialist helping create Model Cards following Google's framework."
        
        result = await self._call_openai(
            prompt=prompt,
            system_message=system_message,
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        return result
