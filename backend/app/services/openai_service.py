from openai import OpenAI
from app.core.config import settings
from typing import Optional, Dict, Any


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


# Singleton instance
openai_service = OpenAIService()
