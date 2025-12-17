"""
Seed script to create default scoring model with dimensions and criteria.
Run this after database migration to set up the initial scoring system.
"""
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.scoring import (
    ScoringModelVersion, ScoringDimension, ScoringCriteria,
    DimensionType, CriteriaType
)
from datetime import datetime


def create_default_scoring_model(db: Session):
    """Create the default scoring model with standard dimensions and criteria."""
    
    # Check if a model already exists
    existing_model = db.query(ScoringModelVersion).first()
    if existing_model:
        print("Scoring model already exists. Skipping seed.")
        return existing_model
    
    print("Creating default scoring model...")
    
    # Create the scoring model version
    model = ScoringModelVersion(
        name="Default Scoring Model",
        description="Standard scoring model for AI initiative prioritization",
        version="v1.0",
        is_active=True,
        value_weight=40.0,
        feasibility_weight=35.0,
        risk_weight=25.0,
        strategic_alignment_weight=0.0,
        activated_at=datetime.utcnow()
    )
    db.add(model)
    db.flush()
    
    print(f"Created scoring model: {model.name} (ID: {model.id})")
    
    # VALUE DIMENSION
    value_dimension = ScoringDimension(
        model_version_id=model.id,
        dimension_type=DimensionType.VALUE,
        name="Business Value",
        description="Potential business impact and value creation",
        weight=40.0,
        color="#4CAF50",
        icon="TrendingUp",
        order=1
    )
    db.add(value_dimension)
    db.flush()
    
    # Value criteria
    value_criteria = [
        {
            "name": "Revenue Uplift",
            "description": "Potential to increase revenue",
            "weight": 30.0,
            "help_text": "Consider direct revenue impact, new revenue streams, and market expansion"
        },
        {
            "name": "Cost Reduction",
            "description": "Potential to reduce operational costs",
            "weight": 25.0,
            "help_text": "Consider automation savings, efficiency gains, and resource optimization"
        },
        {
            "name": "Risk Mitigation",
            "description": "Value from reducing business risks",
            "weight": 20.0,
            "help_text": "Consider compliance, security, and operational risk reduction"
        },
        {
            "name": "Strategic Differentiation",
            "description": "Competitive advantage and market positioning",
            "weight": 25.0,
            "help_text": "Consider unique capabilities, market leadership, and innovation impact"
        }
    ]
    
    for i, criteria_data in enumerate(value_criteria):
        criteria = ScoringCriteria(
            dimension_id=value_dimension.id,
            name=criteria_data["name"],
            description=criteria_data["description"],
            criteria_type=CriteriaType.NUMERIC,
            weight=criteria_data["weight"],
            min_value=0.0,
            max_value=10.0,
            is_inverted=False,
            order=i + 1,
            help_text=criteria_data["help_text"]
        )
        db.add(criteria)
    
    print(f"Created {len(value_criteria)} criteria for Value dimension")
    
    # FEASIBILITY DIMENSION
    feasibility_dimension = ScoringDimension(
        model_version_id=model.id,
        dimension_type=DimensionType.FEASIBILITY,
        name="Technical Feasibility",
        description="Likelihood of successful implementation",
        weight=35.0,
        color="#2196F3",
        icon="Build",
        order=2
    )
    db.add(feasibility_dimension)
    db.flush()
    
    # Feasibility criteria (inverted - lower complexity is better)
    feasibility_criteria = [
        {
            "name": "Data Readiness",
            "description": "Availability and quality of required data",
            "weight": 30.0,
            "is_inverted": False,
            "help_text": "Consider data availability, quality, accessibility, and governance"
        },
        {
            "name": "Technical Complexity",
            "description": "Technical difficulty and complexity",
            "weight": 25.0,
            "is_inverted": True,
            "help_text": "Consider algorithm complexity, integration challenges, and technical debt"
        },
        {
            "name": "Integration Effort",
            "description": "Effort required to integrate with existing systems",
            "weight": 25.0,
            "is_inverted": True,
            "help_text": "Consider system dependencies, API availability, and architectural fit"
        },
        {
            "name": "Time-to-Value",
            "description": "Speed to realize business value",
            "weight": 20.0,
            "is_inverted": True,
            "help_text": "Consider development time, deployment complexity, and adoption timeline"
        }
    ]
    
    for i, criteria_data in enumerate(feasibility_criteria):
        criteria = ScoringCriteria(
            dimension_id=feasibility_dimension.id,
            name=criteria_data["name"],
            description=criteria_data["description"],
            criteria_type=CriteriaType.NUMERIC,
            weight=criteria_data["weight"],
            min_value=0.0,
            max_value=10.0,
            is_inverted=criteria_data["is_inverted"],
            order=i + 1,
            help_text=criteria_data["help_text"]
        )
        db.add(criteria)
    
    print(f"Created {len(feasibility_criteria)} criteria for Feasibility dimension")
    
    # RISK DIMENSION
    risk_dimension = ScoringDimension(
        model_version_id=model.id,
        dimension_type=DimensionType.RISK,
        name="Risk Assessment",
        description="Overall risk profile and mitigation",
        weight=25.0,
        color="#FF9800",
        icon="Warning",
        order=3
    )
    db.add(risk_dimension)
    db.flush()
    
    # Risk criteria
    risk_criteria = [
        {
            "name": "Model Risk",
            "description": "Risk of model failure or poor performance",
            "weight": 30.0,
            "help_text": "Consider model accuracy, bias, explainability, and monitoring"
        },
        {
            "name": "Regulatory Risk",
            "description": "Compliance and regulatory exposure",
            "weight": 30.0,
            "help_text": "Consider GDPR, AI Act, industry regulations, and audit requirements"
        },
        {
            "name": "Ethical Risk",
            "description": "Ethical concerns and societal impact",
            "weight": 20.0,
            "help_text": "Consider fairness, transparency, privacy, and social responsibility"
        },
        {
            "name": "Operational Risk",
            "description": "Risk to business operations",
            "weight": 20.0,
            "help_text": "Consider system reliability, scalability, and business continuity"
        }
    ]
    
    for i, criteria_data in enumerate(risk_criteria):
        criteria = ScoringCriteria(
            dimension_id=risk_dimension.id,
            name=criteria_data["name"],
            description=criteria_data["description"],
            criteria_type=CriteriaType.NUMERIC,
            weight=criteria_data["weight"],
            min_value=0.0,
            max_value=10.0,
            is_inverted=False,
            order=i + 1,
            help_text=criteria_data["help_text"]
        )
        db.add(criteria)
    
    print(f"Created {len(risk_criteria)} criteria for Risk dimension")
    
    db.commit()
    db.refresh(model)
    
    print(f"\n✅ Default scoring model created successfully!")
    print(f"   Model ID: {model.id}")
    print(f"   Version: {model.version}")
    print(f"   Active: {model.is_active}")
    print(f"   Dimensions: 3 (Value, Feasibility, Risk)")
    print(f"   Total Criteria: {len(value_criteria) + len(feasibility_criteria) + len(risk_criteria)}")
    
    return model


def main():
    """Main function to run the seed script."""
    db = SessionLocal()
    try:
        create_default_scoring_model(db)
    except Exception as e:
        print(f"❌ Error creating scoring model: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
