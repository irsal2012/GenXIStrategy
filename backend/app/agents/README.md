# AI Agents Architecture

## Overview

The GenXI Strategy platform uses a modular AI agent architecture following the **human-in-the-loop, orchestrated agents** pattern. Each agent is a specialized AI assistant that provides recommendations and insights while maintaining strict guardrails to ensure human oversight.

## Architecture Pattern

**Human-in-the-loop, orchestrated agents**

- All agents provide **RECOMMENDATIONS only**
- NO agent can auto-approve decisions
- Human approval required for all critical actions
- Explicit warnings in agent responses

## Agent Types

### 1. **Intake Agent** (`intake_agent.py`)
**Module 1: Structuring ideas from unstructured input**

**Responsibilities:**
- Parse unstructured text into structured initiative data
- Detect missing required fields
- Classify AI use cases automatically
- Find similar initiatives to detect duplicates

**Methods:**
- `parse_unstructured_intake(text)` - Extract structured data from free text
- `detect_missing_fields(initiative_data)` - Identify gaps and generate follow-up questions
- `classify_use_case(initiative_data)` - Auto-classify AI type, domain, function, risk tier
- `find_similar_initiatives(initiative_data, existing_initiatives)` - Detect duplicates

**Use Cases:**
- User submits free-form initiative description
- System extracts structured fields automatically
- Identifies missing information and asks clarifying questions
- Detects potential duplicate initiatives

---

### 2. **Portfolio Analyst Agent** (`portfolio_analyst_agent.py`)
**Module 2: Scoring & rationale for portfolio decisions**

**Responsibilities:**
- Calculate initiative scores with detailed justification
- Compare initiatives and explain ranking differences
- Analyze portfolio balance and health
- Optimize portfolio selection under constraints

**Methods:**
- `calculate_initiative_scores(initiative_data, dimensions_info)` - Score with justification
- `compare_initiatives(initiative_a, initiative_b, score_a, score_b)` - Explain rankings
- `analyze_portfolio_balance(portfolio_data)` - Health assessment and rebalancing
- `optimize_portfolio_scenario(initiatives, constraints)` - Portfolio optimization

**Use Cases:**
- Score new initiatives across multiple dimensions
- Compare two initiatives to explain why one ranks higher
- Analyze portfolio mix and recommend rebalancing
- Optimize portfolio selection given budget/capacity constraints

---

### 3. **Roadmap Agent** (`roadmap_agent.py`)
**Module 3: Planning & sequencing initiatives**

**Responsibilities:**
- Suggest optimal initiative sequencing
- Detect roadmap bottlenecks
- Validate timeline feasibility
- Recommend dependency resolution strategies

**Methods:**
- `suggest_initiative_sequencing(initiatives, dependencies, constraints)` - Optimal sequence
- `detect_roadmap_bottlenecks(roadmap_data, resource_allocations, dependencies)` - Identify blockers
- `validate_timeline_feasibility(initiative_data, proposed_timeline, historical_data)` - Timeline assessment
- `recommend_dependency_resolution(dependency_data, initiative_a, initiative_b)` - Unblock strategies

**Use Cases:**
- Determine optimal order to execute initiatives
- Identify resource conflicts and dependency chains
- Validate if proposed timelines are realistic
- Recommend strategies to resolve blocking dependencies

---

### 4. **Governance Agent** (`governance_agent.py`)
**Module 4: Compliance checks (NEVER auto-approves)**

**Responsibilities:**
- Check compliance completeness
- Map applicable regulations
- Draft risk statements
- Recommend risk controls
- Generate model cards

**Methods:**
- `check_compliance_completeness(initiative_data, evidence_documents, risk_tier)` - Artifact completeness
- `map_regulations(initiative_data)` - Identify applicable regulations (GDPR, AI Act, HIPAA, etc.)
- `draft_risk_statement(risk_data, initiative_data)` - Risk statement drafting
- `recommend_risk_controls(risk_data, initiative_data)` - Mitigation controls
- `generate_model_card(initiative_data, model_details)` - Model Card template (Google framework)

**Use Cases:**
- Check if all required governance artifacts are submitted
- Identify which regulations apply to an initiative
- Draft clear, actionable risk statements
- Recommend preventive, detective, and corrective controls
- Generate Model Card templates for documentation

**CRITICAL:** This agent NEVER auto-approves. All responses include explicit warnings that human approval is required.

---

### 5. **Executive Agent** (`executive_agent.py`)
**Module 6: Reporting & storytelling for board/executives**

**Responsibilities:**
- Generate executive narratives with chart recommendations
- Explain portfolio trade-offs
- Prepare talking points for presentations
- Generate board-level summaries
- Provide strategic recommendations

**Methods:**
- `generate_executive_narrative(portfolio_data, report_type, audience, tone)` - Narratives with charts
- `explain_trade_offs(decision_context, alternatives, constraints)` - Trade-off explanations
- `prepare_talking_points(report_data, audience, max_points)` - Presentation talking points
- `generate_board_summary(portfolio_data, period_start, period_end)` - Board summaries
- `generate_strategic_recommendations(portfolio_analysis, trends, gaps)` - Strategic recommendations

**Use Cases:**
- Generate board-ready narratives for presentations
- Explain why one portfolio decision was chosen over alternatives
- Prepare concise talking points for executive meetings
- Create 2-3 paragraph board summaries
- Generate actionable strategic recommendations

---

## Guardrails (All Agents)

### 1. **RBAC-aware memory**
- Agents receive filtered data based on user permissions
- No direct database access
- All data passed through service layer

### 2. **Fail gracefully**
- All methods use try/except blocks
- Return `{"success": False, "error": str(e)}` on failure
- Never crash the application

### 3. **Source-linked explanations**
- All recommendations include detailed reasoning
- Cite specific data points and metrics
- Provide confidence scores (0-100)

### 4. **Explicit confidence indicators**
- Every AI response includes `"confidence": 0-100` or `"confidence_score": 0.0-1.0`
- Agents acknowledge uncertainty
- Provide alternative scenarios when confidence is lower

---

## Base Agent Class

All agents inherit from `BaseAgent` (`base_agent.py`), which provides:

- **OpenAI client management** - Shared client initialization
- **Error handling** - Consistent error handling across agents
- **Logging** - Structured logging for monitoring
- **Response validation** - Validate confidence scores
- **Helper methods** - Common utilities for all agents

---

## Usage Example

```python
from app.services.openai_service import openai_service

# Intake Agent - Parse unstructured text
result = await openai_service.parse_unstructured_intake(
    text="We need a chatbot to help customers with product recommendations..."
)

# Portfolio Analyst - Score initiative
result = await openai_service.calculate_initiative_scores(
    initiative_data={...},
    dimensions_info=[...]
)

# Roadmap Agent - Suggest sequencing
result = await openai_service.suggest_initiative_sequencing(
    initiatives=[...],
    dependencies=[...],
    constraints={...}
)

# Governance Agent - Check compliance
result = await openai_service.check_compliance_completeness(
    initiative_data={...},
    evidence_documents=[...],
    risk_tier="high"
)

# Executive Agent - Generate narrative
result = await openai_service.generate_executive_narrative(
    portfolio_data={...},
    report_type="board_slides",
    audience="board"
)
```

---

## OpenAI Service Orchestrator

The `OpenAIService` class (`backend/app/services/openai_service.py`) acts as a facade/orchestrator:

- Initializes all agents
- Delegates method calls to appropriate agents
- Maintains backward compatibility with existing code
- Provides a single entry point for all AI functionality

---

## Testing

Each agent can be tested independently:

```python
from app.agents import IntakeAgent
from openai import OpenAI

client = OpenAI(api_key="your-key")
agent = IntakeAgent(client, "gpt-4")

result = await agent.parse_unstructured_intake("test text")
assert result["success"] == True
```

---

## Adding New Agents

To add a new agent:

1. Create new agent file in `backend/app/agents/`
2. Inherit from `BaseAgent`
3. Implement agent-specific methods
4. Add to `__init__.py` exports
5. Initialize in `OpenAIService.__init__()`
6. Add delegation methods to `OpenAIService`

---

## Best Practices

### 1. **Always use human-in-the-loop**
- Never auto-approve decisions
- Include explicit warnings in responses
- Provide recommendations, not decisions

### 2. **Provide confidence scores**
- Every response should include confidence indicators
- Acknowledge uncertainty
- Provide alternative scenarios

### 3. **Source-linked explanations**
- Cite specific data points
- Explain reasoning clearly
- Provide actionable insights

### 4. **Error handling**
- Use try/except blocks
- Return structured error responses
- Log errors for monitoring

### 5. **Keep prompts focused**
- Each method should have a clear, specific purpose
- Avoid overly complex prompts
- Use structured JSON responses

---

## Monitoring & Logging

All agent calls are logged with:
- Agent name
- Method name
- Success/failure status
- Execution time
- Error details (if applicable)

Logs can be found in application logs with format:
```
[AgentName].method_name: SUCCESS/FAILED - details
```

---

## Security Considerations

1. **API Key Management** - OpenAI API key stored in environment variables
2. **RBAC Enforcement** - Agents receive filtered data based on user permissions
3. **No Auto-Approval** - All critical decisions require human approval
4. **Audit Trail** - All agent interactions are logged
5. **Rate Limiting** - Consider implementing rate limits for API calls

---

## Future Enhancements

- **Agent Chaining** - Allow agents to call other agents
- **Context Memory** - Maintain conversation context across calls
- **Fine-tuning** - Fine-tune models for specific agent tasks
- **A/B Testing** - Test different prompts and models
- **Performance Metrics** - Track agent accuracy and usefulness
- **User Feedback** - Collect feedback on agent recommendations

---

## Support

For questions or issues with AI agents:
1. Check agent logs for error details
2. Review agent documentation above
3. Test agent independently to isolate issues
4. Contact development team for assistance

---

**Last Updated:** December 17, 2025
**Version:** 1.0
**Status:** Production Ready
