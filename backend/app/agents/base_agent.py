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
        prompt: str,
        system_message: str,
        temperature: float = 0.5,
        response_format: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Make a call to OpenAI API with error handling and logging.
        
        Args:
            prompt: User prompt
            system_message: System message defining agent role
            temperature: Sampling temperature (0.0-1.0)
            response_format: Optional response format (e.g., {"type": "json_object"})
            
        Returns:
            Dictionary with success status and data or error
        """
        try:
            logger.info(f"{self.agent_name}: Making OpenAI API call")
            
            # Prepare API call parameters
            api_params = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": prompt}
                ],
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
            
            return {
                "success": True,
                "data": content
            }
            
        except Exception as e:
            logger.error(f"{self.agent_name}: OpenAI API call failed - {str(e)}")
            return self._handle_error(e)
    
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
        method_name: str
    ) -> Dict[str, Any]:
        """
        Format a successful response with metadata.
        
        Args:
            data: Response data
            method_name: Name of the method
            
        Returns:
            Formatted response dictionary
        """
        self._log_agent_call(method_name, success=True)
        
        return {
            "success": True,
            "data": data,
            "agent": self.agent_name,
            "method": method_name
        }
    
    def _format_error_response(
        self,
        error: str,
        method_name: str
    ) -> Dict[str, Any]:
        """
        Format an error response with metadata.
        
        Args:
            error: Error message
            method_name: Name of the method
            
        Returns:
            Formatted error dictionary
        """
        self._log_agent_call(method_name, success=False, details=error)
        
        return {
            "success": False,
            "error": error,
            "agent": self.agent_name,
            "method": method_name
        }
