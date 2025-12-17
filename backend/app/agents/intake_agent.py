"""
Intake Agent

Module 1: Structuring ideas from unstructured input

Responsibilities:
- Parse unstructured text into structured initiative data
- Detect missing required fields
- Classify AI use cases automatically
- Find similar initiatives to detect duplicates

Guardrails:
- RBAC-aware (receives filtered data)
- Confidence scores on all classifications
- Source-linked explanations
- Never auto-approves initiatives
"""

from typing import Dict, Any, List
from .base_agent import BaseAgent


class IntakeAgent(BaseAgent):
    """
    Intake Agent for structuring unstructured initiative ideas.
    
    This agent helps users convert free-form text into structured
    initiative data, identifies missing information, and detects
    potential duplicates.
    """
    
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
        
        system_message = "You are an AI initiative intake specialist who extracts structured data from unstructured text."
        
        result = await self._call_openai(
            prompt=prompt,
            system_message=system_message,
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        return result
    
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
        {{
          "missing_fields": [
            {{
              "field": "field_name",
              "importance": "why it matters",
              "question": "specific question to ask"
            }}
          ],
          "completeness_score": 0-100
        }}
        """
        
        system_message = "You are an AI intake specialist helping users complete initiative forms."
        
        result = await self._call_openai(
            prompt=prompt,
            system_message=system_message,
            temperature=0.5,
            response_format={"type": "json_object"}
        )
        
        return result
    
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
        {{
          "ai_type": {{"value": "...", "confidence": 0-100, "reasoning": "..."}},
          "strategic_domain": {{"value": "...", "confidence": 0-100, "reasoning": "..."}},
          "business_function": {{"value": "...", "confidence": 0-100, "reasoning": "..."}},
          "risk_tier": {{"value": "...", "confidence": 0-100, "reasoning": "..."}}
        }}
        """
        
        system_message = "You are an AI classification expert specializing in enterprise AI initiatives."
        
        result = await self._call_openai(
            prompt=prompt,
            system_message=system_message,
            temperature=0.4,
            response_format={"type": "json_object"}
        )
        
        return result
    
    async def find_similar_initiatives(
        self, 
        initiative_data: Dict[str, Any], 
        existing_initiatives: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
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
        {{
          "similar_initiatives": [
            {{
              "id": initiative_id,
              "title": "...",
              "similarity_score": 0-100,
              "similarity_reasons": ["reason1", "reason2"],
              "recommendation": "duplicate|collaborate|consolidate|proceed"
            }}
          ]
        }}
        
        If no similar initiatives found, return empty array.
        """
        
        system_message = "You are an AI portfolio analyst specializing in identifying duplicate or overlapping initiatives."
        
        result = await self._call_openai(
            prompt=prompt,
            system_message=system_message,
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        return result
