"""
Migration script to add process template tables for strategic intake workflow.
Run this script to create the new tables in the database.
"""
from sqlalchemy import create_engine, text
from app.core.config import settings
from app.core.database import Base
from app.models.process_template import (
    ProcessTemplate,
    ProcessExecution,
    StepExecution,
    StrategyArtifact
)
import json


def upgrade():
    """Create the new tables"""
    engine = create_engine(settings.DATABASE_URL)
    
    # Create tables
    ProcessTemplate.__table__.create(engine, checkfirst=True)
    ProcessExecution.__table__.create(engine, checkfirst=True)
    StepExecution.__table__.create(engine, checkfirst=True)
    StrategyArtifact.__table__.create(engine, checkfirst=True)
    
    print("✓ Created process_templates table")
    print("✓ Created process_executions table")
    print("✓ Created step_executions table")
    print("✓ Created strategy_artifacts table")
    
    # Create default template
    create_default_template(engine)


def create_default_template(engine):
    """Create a default strategic intake template"""
    from sqlalchemy.orm import Session
    from app.models.user import User
    
    session = Session(engine)
    
    try:
        # Get the first admin user (or any user) to be the creator
        admin_user = session.query(User).first()
        if not admin_user:
            print("⚠ No users found. Please create a user first before running this migration.")
            return
        
        # Check if default template already exists
        existing = session.query(ProcessTemplate).filter_by(is_default=True).first()
        if existing:
            print("✓ Default template already exists")
            return
        
        # Define the default template steps
        # New Flow: Corporate Strategy → Strategic Orientation → Strategic Objectives → Strategic Capability Needs → Strategic AI Initiative → Business Objectives (KPIs)
        default_steps = [
            {
                "name": "Strategic Orientation",
                "type": "strategy_analysis",
                "order": 1,
                "description": "Analyze corporate strategy and extract strategic themes/pillars",
                "prompt_template": """Analyze the following corporate strategy statement and extract 3-5 strategic themes/pillars that represent the core strategic directions.

Corporate Strategy:
{corporate_strategy}

For each strategic theme/pillar, provide:
- Unique ID (theme_1, theme_2, etc.)
- Name (concise, strategic pillar name)
- Description (what this theme represents)
- Priority level (high, medium, low)
- Focus areas (specific areas of focus within this theme)

Return as JSON with structure:
{
  "themes": [
    {
      "id": "theme_1",
      "name": "Customer Experience Excellence",
      "description": "Transform customer interactions through AI-powered solutions",
      "priority": "high",
      "focus_areas": ["automation", "personalization", "analytics"]
    }
  ]
}""",
                "output_schema": {
                    "type": "object",
                    "required": ["themes"],
                    "properties": {
                        "themes": {
                            "type": "array",
                            "minItems": 3,
                            "maxItems": 5,
                            "items": {
                                "type": "object",
                                "required": ["id", "name", "description", "priority", "focus_areas"],
                                "properties": {
                                    "id": {"type": "string", "pattern": "^theme_[0-9]+$"},
                                    "name": {"type": "string"},
                                    "description": {"type": "string"},
                                    "priority": {"type": "string", "enum": ["high", "medium", "low"]},
                                    "focus_areas": {"type": "array", "items": {"type": "string"}}
                                }
                            }
                        }
                    }
                }
            },
            {
                "name": "Strategic Objectives",
                "type": "objective_generation",
                "order": 2,
                "description": "Define specific, measurable strategic objectives for selected themes",
                "prompt_template": """Based on the selected strategic themes, define 4-6 specific, measurable strategic objectives that the organization must achieve.

Strategic Themes:
{previous_output}

Selected Theme IDs (user selected):
{selected_theme_ids}

Corporate Strategy:
{corporate_strategy}

IMPORTANT: Only generate objectives for the themes with IDs in the selected_theme_ids list. Ignore other themes.

For each strategic objective, provide:
- Unique ID (obj_1, obj_2, etc.)
- Name (clear, specific objective statement)
- Description (detailed explanation of what success looks like)
- Linked theme ID from strategic orientation
- Objective type (e.g., "Revenue Growth", "Cost Reduction", "Customer Satisfaction", "Operational Excellence", "Innovation", "Market Expansion")
- Target metric (what will be measured)
- Baseline value (current state)
- Target value (desired state)
- Target date (when this should be achieved)
- Priority (high, medium, low)
- Success criteria (how we'll know we've achieved it)

Return as JSON:
{
  "objectives": [
    {
      "id": "obj_1",
      "name": "Achieve 95% Customer Satisfaction Score",
      "description": "Transform customer experience to achieve industry-leading satisfaction scores through AI-powered personalization and support",
      "theme_id": "theme_1",
      "objective_type": "Customer Satisfaction",
      "target_metric": "Customer Satisfaction Score (CSAT)",
      "baseline": 72,
      "target": 95,
      "target_date": "2026-12-31",
      "priority": "high",
      "success_criteria": "Sustained CSAT score of 95% or higher for 3 consecutive quarters"
    }
  ]
}""",
                "output_schema": {
                    "type": "object",
                    "required": ["objectives"],
                    "properties": {
                        "objectives": {
                            "type": "array",
                            "minItems": 4,
                            "maxItems": 6,
                            "items": {
                                "type": "object",
                                "required": ["id", "name", "description", "theme_id", "objective_type", "target_metric", "baseline", "target", "target_date", "priority"],
                                "properties": {
                                    "id": {"type": "string", "pattern": "^obj_[0-9]+$"},
                                    "name": {"type": "string"},
                                    "description": {"type": "string"},
                                    "theme_id": {"type": "string"},
                                    "objective_type": {"type": "string"},
                                    "target_metric": {"type": "string"},
                                    "baseline": {"type": "number"},
                                    "target": {"type": "number"},
                                    "target_date": {"type": "string"},
                                    "priority": {"type": "string", "enum": ["high", "medium", "low"]},
                                    "success_criteria": {"type": "string"}
                                }
                            }
                        }
                    }
                }
            },
            {
                "name": "Strategic Capability Needs",
                "type": "capability_mapping",
                "order": 3,
                "description": "Identify AI capabilities needed to achieve strategic objectives",
                "prompt_template": """Based on the strategic objectives, identify the AI capabilities needed to achieve each objective.

Strategic Objectives:
{previous_output}

Selected Objective IDs (user selected):
{selected_objective_ids}

Strategic Themes (for context):
{strategic_orientation}

Corporate Strategy:
{corporate_strategy}

IMPORTANT: Only generate capabilities for the objectives with IDs in the selected_objective_ids list. Ignore other objectives.

For each capability, provide:
- Unique ID (cap_1, cap_2, etc.)
- Name (clear capability name)
- Description (what this capability enables)
- Linked objective ID(s) from strategic objectives
- Capability type (e.g., "GenAI", "Predictive Analytics", "Computer Vision", "Optimization", "Automation")
- Current maturity level (1-5, where 1=none, 5=advanced)
- Target maturity level (1-5)
- Current state description
- Target state description

Return as JSON:
{
  "capabilities": [
    {
      "id": "cap_1",
      "name": "Conversational AI",
      "description": "Natural language understanding and generation for customer interactions",
      "objective_ids": ["obj_1"],
      "capability_type": "GenAI",
      "current_maturity": 1,
      "target_maturity": 4,
      "current_state": "No conversational AI capabilities",
      "target_state": "Advanced multi-turn conversations with context awareness"
    }
  ]
}""",
                "output_schema": {
                    "type": "object",
                    "required": ["capabilities"],
                    "properties": {
                        "capabilities": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "required": ["id", "name", "description", "objective_ids", "capability_type", "current_maturity", "target_maturity"],
                                "properties": {
                                    "id": {"type": "string", "pattern": "^cap_[0-9]+$"},
                                    "name": {"type": "string"},
                                    "description": {"type": "string"},
                                    "objective_ids": {"type": "array", "items": {"type": "string"}},
                                    "capability_type": {"type": "string"},
                                    "current_maturity": {"type": "integer", "minimum": 1, "maximum": 5},
                                    "target_maturity": {"type": "integer", "minimum": 1, "maximum": 5},
                                    "current_state": {"type": "string"},
                                    "target_state": {"type": "string"}
                                }
                            }
                        }
                    }
                }
            },
            {
                "name": "Strategic AI Initiative",
                "type": "initiative_generation",
                "order": 4,
                "description": "Generate specific AI initiatives to build required capabilities",
                "prompt_template": """For each capability, generate 1-3 specific AI initiatives that will build or enhance that capability.

Capabilities:
{previous_output}

Selected Capability IDs (user selected):
{selected_capability_ids}

Strategic Objectives (for context):
{strategic_objectives}

Strategic Themes (for context):
{strategic_orientation}

IMPORTANT: Only generate initiatives for the capabilities with IDs in the selected_capability_ids list. Ignore other capabilities.

For each initiative, provide:
- Unique ID (init_1, init_2, etc.)
- Title (clear, specific initiative name)
- Description (what will be built/implemented)
- Business objective (the "why" - business value)
- Linked capability ID
- AI type (genai, predictive, optimization, automation)
- Technologies (list of specific technologies/tools)
- Data sources needed
- Expected ROI (percentage)
- Budget estimate (USD)
- Timeline (months)
- Risk tier (low, medium, high)

Return as JSON:
{
  "initiatives": [
    {
      "id": "init_1",
      "title": "AI-Powered Customer Support Chatbot",
      "description": "Deploy intelligent chatbot for 24/7 customer support with natural language understanding",
      "business_objective": "Reduce support costs by 40% while improving customer satisfaction",
      "capability_id": "cap_1",
      "ai_type": "genai",
      "technologies": ["GPT-4", "LangChain", "Python", "Azure OpenAI"],
      "data_sources": ["Customer Support Tickets", "Knowledge Base", "Product Documentation"],
      "expected_roi": 150,
      "budget_estimate": 250000,
      "timeline_months": 6,
      "risk_tier": "medium"
    }
  ]
}""",
                "output_schema": {
                    "type": "object",
                    "required": ["initiatives"],
                    "properties": {
                        "initiatives": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "required": ["id", "title", "description", "business_objective", "capability_id", "ai_type"],
                                "properties": {
                                    "id": {"type": "string", "pattern": "^init_[0-9]+$"},
                                    "title": {"type": "string"},
                                    "description": {"type": "string"},
                                    "business_objective": {"type": "string"},
                                    "capability_id": {"type": "string"},
                                    "ai_type": {"type": "string", "enum": ["genai", "predictive", "optimization", "automation"]},
                                    "technologies": {"type": "array", "items": {"type": "string"}},
                                    "data_sources": {"type": "array", "items": {"type": "string"}},
                                    "expected_roi": {"type": "number"},
                                    "budget_estimate": {"type": "number"},
                                    "timeline_months": {"type": "integer"},
                                    "risk_tier": {"type": "string", "enum": ["low", "medium", "high"]}
                                }
                            }
                        }
                    }
                }
            },
            {
                "name": "Business Objectives (KPIs)",
                "type": "objective_generation",
                "order": 5,
                "description": "Define measurable KPIs for each AI initiative",
                "prompt_template": """For each AI initiative, define 3-5 specific, measurable KPIs that will track the success of the initiative.

AI Initiatives:
{previous_output}

For each KPI, provide:
- Unique ID (kpi_1, kpi_2, etc.)
- Linked initiative ID
- Name (clear, specific KPI name)
- Description (what this KPI measures)
- Metric type (percentage, count, currency, time, score)
- Baseline value (current state)
- Target value (desired state)
- Measurement method (how it will be measured)
- Measurement frequency (daily, weekly, monthly, quarterly)
- Target date (when target should be achieved)

Return as JSON:
{
  "kpis": [
    {
      "id": "kpi_1",
      "initiative_id": "init_1",
      "name": "Customer Query Resolution Rate",
      "description": "Percentage of customer queries resolved by AI without human intervention",
      "metric_type": "percentage",
      "baseline": 0,
      "target": 80,
      "measurement_method": "Automated tracking via chatbot analytics dashboard",
      "measurement_frequency": "weekly",
      "target_date": "2026-12-31"
    }
  ]
}""",
                "output_schema": {
                    "type": "object",
                    "required": ["kpis"],
                    "properties": {
                        "kpis": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "required": ["id", "initiative_id", "name", "description", "metric_type", "baseline", "target", "measurement_method", "measurement_frequency"],
                                "properties": {
                                    "id": {"type": "string", "pattern": "^kpi_[0-9]+$"},
                                    "initiative_id": {"type": "string"},
                                    "name": {"type": "string"},
                                    "description": {"type": "string"},
                                    "metric_type": {"type": "string", "enum": ["percentage", "count", "currency", "time", "score"]},
                                    "baseline": {"type": "number"},
                                    "target": {"type": "number"},
                                    "measurement_method": {"type": "string"},
                                    "measurement_frequency": {"type": "string", "enum": ["daily", "weekly", "monthly", "quarterly"]},
                                    "target_date": {"type": "string"}
                                }
                            }
                        }
                    }
                }
            }
        ]
        
        # Create the default template
        default_template = ProcessTemplate(
            name="Strategic AI Intake - Default",
            description="Default template for strategic AI initiative intake. Transforms corporate strategy into actionable AI initiatives with full traceability.",
            is_default=True,
            is_active=True,
            steps=default_steps,
            created_by=admin_user.id
        )
        
        session.add(default_template)
        session.commit()
        
        print(f"✓ Created default template with {len(default_steps)} steps")
        print(f"  Template ID: {default_template.id}")
        print(f"  Steps: Strategic Orientation → Strategic Objectives → Capability Needs → AI Initiative → KPIs")
        
    except Exception as e:
        session.rollback()
        print(f"✗ Error creating default template: {e}")
        raise
    finally:
        session.close()


def downgrade():
    """Drop the tables"""
    engine = create_engine(settings.DATABASE_URL)
    
    StrategyArtifact.__table__.drop(engine, checkfirst=True)
    StepExecution.__table__.drop(engine, checkfirst=True)
    ProcessExecution.__table__.drop(engine, checkfirst=True)
    ProcessTemplate.__table__.drop(engine, checkfirst=True)
    
    print("✓ Dropped strategy_artifacts table")
    print("✓ Dropped step_executions table")
    print("✓ Dropped process_executions table")
    print("✓ Dropped process_templates table")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "downgrade":
        print("Running downgrade...")
        downgrade()
    else:
        print("Running upgrade...")
        upgrade()
    
    print("\n✓ Migration complete!")
