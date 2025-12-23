"""
Base Agent Class

Provides shared functionality for all AI agents including:
- OpenAI client management
- Error handling
- Logging
- Response validation
- Confidence score validation
"""

from typing import Dict, Any, Optional
from openai import OpenAI
import logging

logger = logging.getLogger(__name__)


class BaseAgent:
    """
    Base class for all AI agents in the GenXI Strategy platform.
    
    All agents inherit from this class to ensure consistent:
    - Error handling
    - Logging
    - Response formatting
    - Confidence score validation
    
    Guardrails:
    - Fail gracefully with detailed error messages
    - Log all agent interactions
    - Validate confidence scores
    - Provide source-linked explanations
    """
    
    def __init__(self, openai_client: OpenAI, model: str):
        """
        Initialize the base agent.
        
        Args:
            openai_client: Configured OpenAI client instance
            model: Model name to use (e.g., "gpt-4", "gpt-3.5-turbo")
        """
        self.client = openai_client
        self.model = model
        self.agent_name = self.__class__.__name__
    
    async def _call_openai(
        self,
        messages: list,
        temperature: float = 0.5,
        response_format: Optional[Dict[str, str]] = None
    ) -> str:
        """
        Make a call to OpenAI API with error handling and logging.
        
        Args:
            messages: List of message dictionaries with role and content
            temperature: Sampling temperature (0.0-1.0)
            response_format: Optional response format (e.g., {"type": "json_object"})
            
        Returns:
            String response content from the API
        """
        try:
            logger.info(f"{self.agent_name}: Making OpenAI API call")
            
            # Prepare API call parameters
            api_params = {
                "model": self.model,
                "messages": messages,
                "temperature": temperature
            }
            
            # Add response format if specified
            if response_format:
                api_params["response_format"] = response_format
            
            # Make API call
            response = self.client.chat.completions.create(**api_params)
            
            # Extract content
            content = response.choices[0].message.content
            
            logger.info(f"{self.agent_name}: OpenAI API call successful")
            
            return content
            
        except Exception as e:
            logger.error(f"{self.agent_name}: OpenAI API call failed - {str(e)}")
            raise
    
    def _handle_error(self, exception: Exception) -> Dict[str, Any]:
        """
        Handle errors gracefully and return structured error response.
        
        Args:
            exception: The exception that occurred
            
        Returns:
            Dictionary with error information
        """
        error_message = str(exception)
        
        # Log the error
        logger.error(f"{self.agent_name}: Error - {error_message}")
        
        # Return structured error response
        return {
            "success": False,
            "error": error_message,
            "agent": self.agent_name
        }
    
    def _validate_confidence(self, response_data: Any) -> bool:
        """
        Validate that response includes confidence indicators.
        
        Args:
            response_data: Response data to validate
            
        Returns:
            True if confidence indicators present, False otherwise
        """
        if isinstance(response_data, dict):
            # Check for common confidence field names
            confidence_fields = [
                "confidence",
                "confidence_score",
                "confidence_level"
            ]
            
            for field in confidence_fields:
                if field in response_data:
                    return True
        
        return False
    
    def _log_agent_call(
        self,
        method_name: str,
        success: bool,
        details: Optional[str] = None
    ) -> None:
        """
        Log agent method calls for monitoring and debugging.
        
        Args:
            method_name: Name of the method called
            success: Whether the call was successful
            details: Optional additional details
        """
        status = "SUCCESS" if success else "FAILED"
        log_message = f"{self.agent_name}.{method_name}: {status}"
        
        if details:
            log_message += f" - {details}"
        
        if success:
            logger.info(log_message)
        else:
            logger.error(log_message)
    
    def _format_success_response(
        self,
        data: Any,
        message: str = None
    ) -> Dict[str, Any]:
        """
        Format a successful response with metadata.
        
        Args:
            data: Response data
            message: Optional message describing the result
            
        Returns:
            Formatted response dictionary
        """
        response = {
            "success": True,
            "data": data,
            "agent": self.agent_name
        }
        
        if message:
            response["message"] = message
        
        return response
    
    def _format_error_response(
        self,
        error: str
    ) -> Dict[str, Any]:
        """
        Format an error response with metadata.
        
        Args:
            error: Error message
            
        Returns:
            Formatted error dictionary
        """
        return {
            "success": False,
            "error": error,
            "agent": self.agent_name
        }
    
    def _parse_json_response(self, content: str) -> dict:
        """
        Parse JSON response from OpenAI API.
        
        Args:
            content: String content from API response
            
        Returns:
            Parsed JSON dictionary
        """
        import json
        
        # Try direct JSON parse first
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            pass
        
        # Try to extract JSON from markdown code blocks
        if "```json" in content:
            start = content.find("```json") + 7
            end = content.find("```", start)
            if end != -1:
                json_str = content[start:end].strip()
                return json.loads(json_str)
        elif "```" in content:
            start = content.find("```") + 3
            end = content.find("```", start)
            if end != -1:
                json_str = content[start:end].strip()
                return json.loads(json_str)
        
        # Try to find JSON object in the content
        start = content.find("{")
        end = content.rfind("}")
        if start != -1 and end != -1:
            json_str = content[start:end+1]
            return json.loads(json_str)
        
        raise ValueError(f"Could not parse JSON from response: {content[:200]}")
