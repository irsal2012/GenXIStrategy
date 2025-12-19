"""Seed comprehensive analytics test data.

This script creates a rich dataset of initiatives and risks to populate
the Analytics dashboard with meaningful visualizations and metrics.
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.initiative import Initiative, InitiativeStatus, InitiativePriority, AIType
from app.models.risk import Risk, RiskCategory, RiskSeverity, RiskStatus
from app.models.user import User


def seed_analytics_data(db: Session) -> None:
    """Create comprehensive test data for analytics dashboard."""
    
    # Get the admin user to assign as owner
    admin_user = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin_user:
        print("Error: Admin user not found. Please run seed_default_admin first.")
        return
    
    # Clear existing data (optional - comment out if you want to keep existing data)
    print("Clearing existing initiatives and risks...")
    db.query(Risk).delete()
    db.query(Initiative).delete()
    db.commit()
    
    print("Creating test initiatives...")
    
    # Define comprehensive initiative data
    initiatives_data = [
        {
            "title": "Customer Service AI Chatbot",
            "description": "Deploy GenAI-powered chatbot to handle tier-1 customer inquiries and reduce support costs by 40%",
            "business_objective": "Improve customer satisfaction and reduce operational costs",
            "status": InitiativeStatus.PRODUCTION,
            "priority": InitiativePriority.CRITICAL,
            "ai_type": AIType.GENAI,
            "strategic_domain": "Customer Experience",
            "business_function": "Customer Support",
            "budget_allocated": 2500000.0,
            "budget_spent": 2100000.0,
            "expected_roi": 85.0,
            "actual_roi": 78.0,
            "business_value_score": 9,
            "technical_feasibility_score": 8,
            "risk_score": 4,
            "strategic_alignment_score": 9,
            "start_date": datetime.utcnow() - timedelta(days=180),
            "target_completion_date": datetime.utcnow() + timedelta(days=30),
        },
        {
            "title": "Predictive Maintenance System",
            "description": "ML-based predictive maintenance for manufacturing equipment to reduce downtime",
            "business_objective": "Minimize equipment failures and optimize maintenance schedules",
            "status": InitiativeStatus.PILOT,
            "priority": InitiativePriority.HIGH,
            "ai_type": AIType.PREDICTIVE,
            "strategic_domain": "Operations",
            "business_function": "Manufacturing",
            "budget_allocated": 1800000.0,
            "budget_spent": 950000.0,
            "expected_roi": 120.0,
            "business_value_score": 8,
            "technical_feasibility_score": 7,
            "risk_score": 5,
            "strategic_alignment_score": 8,
            "start_date": datetime.utcnow() - timedelta(days=90),
            "target_completion_date": datetime.utcnow() + timedelta(days=120),
        },
        {
            "title": "Fraud Detection AI",
            "description": "Real-time fraud detection system using machine learning to identify suspicious transactions",
            "business_objective": "Reduce fraud losses and improve transaction security",
            "status": InitiativeStatus.PRODUCTION,
            "priority": InitiativePriority.CRITICAL,
            "ai_type": AIType.PREDICTIVE,
            "strategic_domain": "Risk Management",
            "business_function": "Finance",
            "budget_allocated": 3200000.0,
            "budget_spent": 2950000.0,
            "expected_roi": 150.0,
            "actual_roi": 145.0,
            "business_value_score": 10,
            "technical_feasibility_score": 9,
            "risk_score": 3,
            "strategic_alignment_score": 10,
            "start_date": datetime.utcnow() - timedelta(days=270),
            "target_completion_date": datetime.utcnow() - timedelta(days=30),
        },
        {
            "title": "Supply Chain Optimization",
            "description": "AI-driven supply chain optimization to reduce costs and improve delivery times",
            "business_objective": "Optimize inventory levels and reduce logistics costs by 25%",
            "status": InitiativeStatus.PLANNING,
            "priority": InitiativePriority.HIGH,
            "ai_type": AIType.OPTIMIZATION,
            "strategic_domain": "Operations",
            "business_function": "Supply Chain",
            "budget_allocated": 2800000.0,
            "budget_spent": 450000.0,
            "expected_roi": 95.0,
            "business_value_score": 9,
            "technical_feasibility_score": 6,
            "risk_score": 6,
            "strategic_alignment_score": 9,
            "start_date": datetime.utcnow() - timedelta(days=45),
            "target_completion_date": datetime.utcnow() + timedelta(days=180),
        },
        {
            "title": "HR Recruitment Automation",
            "description": "Automate resume screening and candidate matching using AI",
            "business_objective": "Reduce time-to-hire by 50% and improve candidate quality",
            "status": InitiativeStatus.PILOT,
            "priority": InitiativePriority.MEDIUM,
            "ai_type": AIType.AUTOMATION,
            "strategic_domain": "Human Resources",
            "business_function": "HR",
            "budget_allocated": 850000.0,
            "budget_spent": 520000.0,
            "expected_roi": 65.0,
            "business_value_score": 7,
            "technical_feasibility_score": 8,
            "risk_score": 4,
            "strategic_alignment_score": 7,
            "start_date": datetime.utcnow() - timedelta(days=60),
            "target_completion_date": datetime.utcnow() + timedelta(days=90),
        },
        {
            "title": "Marketing Campaign Optimizer",
            "description": "AI-powered marketing campaign optimization and personalization engine",
            "business_objective": "Increase marketing ROI by 40% through better targeting",
            "status": InitiativeStatus.PRODUCTION,
            "priority": InitiativePriority.HIGH,
            "ai_type": AIType.OPTIMIZATION,
            "strategic_domain": "Customer Experience",
            "business_function": "Marketing",
            "budget_allocated": 1500000.0,
            "budget_spent": 1350000.0,
            "expected_roi": 110.0,
            "actual_roi": 98.0,
            "business_value_score": 8,
            "technical_feasibility_score": 9,
            "risk_score": 3,
            "strategic_alignment_score": 8,
            "start_date": datetime.utcnow() - timedelta(days=150),
            "target_completion_date": datetime.utcnow() - timedelta(days=15),
        },
        {
            "title": "Document Intelligence System",
            "description": "GenAI system for automated document processing and information extraction",
            "business_objective": "Reduce manual document processing time by 70%",
            "status": InitiativeStatus.PLANNING,
            "priority": InitiativePriority.MEDIUM,
            "ai_type": AIType.GENAI,
            "strategic_domain": "Operations",
            "business_function": "Operations",
            "budget_allocated": 1200000.0,
            "budget_spent": 280000.0,
            "expected_roi": 75.0,
            "business_value_score": 7,
            "technical_feasibility_score": 7,
            "risk_score": 5,
            "strategic_alignment_score": 7,
            "start_date": datetime.utcnow() - timedelta(days=30),
            "target_completion_date": datetime.utcnow() + timedelta(days=150),
        },
        {
            "title": "Sales Forecasting AI",
            "description": "Predictive analytics for accurate sales forecasting and pipeline management",
            "business_objective": "Improve forecast accuracy to 95% and optimize resource allocation",
            "status": InitiativeStatus.PILOT,
            "priority": InitiativePriority.HIGH,
            "ai_type": AIType.PREDICTIVE,
            "strategic_domain": "Revenue Growth",
            "business_function": "Sales",
            "budget_allocated": 950000.0,
            "budget_spent": 680000.0,
            "expected_roi": 88.0,
            "business_value_score": 8,
            "technical_feasibility_score": 8,
            "risk_score": 4,
            "strategic_alignment_score": 9,
            "start_date": datetime.utcnow() - timedelta(days=75),
            "target_completion_date": datetime.utcnow() + timedelta(days=60),
        },
        {
            "title": "Quality Control Vision System",
            "description": "Computer vision AI for automated quality inspection in manufacturing",
            "business_objective": "Reduce defect rate by 60% and improve inspection speed",
            "status": InitiativeStatus.IDEATION,
            "priority": InitiativePriority.MEDIUM,
            "ai_type": AIType.PREDICTIVE,
            "strategic_domain": "Operations",
            "business_function": "Manufacturing",
            "budget_allocated": 2100000.0,
            "budget_spent": 150000.0,
            "expected_roi": 105.0,
            "business_value_score": 8,
            "technical_feasibility_score": 6,
            "risk_score": 6,
            "strategic_alignment_score": 8,
            "start_date": datetime.utcnow() - timedelta(days=15),
            "target_completion_date": datetime.utcnow() + timedelta(days=240),
        },
        {
            "title": "Energy Consumption Optimizer",
            "description": "AI system to optimize building energy consumption and reduce costs",
            "business_objective": "Reduce energy costs by 30% through intelligent optimization",
            "status": InitiativeStatus.PLANNING,
            "priority": InitiativePriority.LOW,
            "ai_type": AIType.OPTIMIZATION,
            "strategic_domain": "Sustainability",
            "business_function": "Facilities",
            "budget_allocated": 680000.0,
            "budget_spent": 120000.0,
            "expected_roi": 55.0,
            "business_value_score": 6,
            "technical_feasibility_score": 7,
            "risk_score": 3,
            "strategic_alignment_score": 6,
            "start_date": datetime.utcnow() - timedelta(days=20),
            "target_completion_date": datetime.utcnow() + timedelta(days=180),
        },
        {
            "title": "Customer Churn Prediction",
            "description": "ML model to predict customer churn and enable proactive retention",
            "business_objective": "Reduce customer churn by 35% through early intervention",
            "status": InitiativeStatus.PRODUCTION,
            "priority": InitiativePriority.CRITICAL,
            "ai_type": AIType.PREDICTIVE,
            "strategic_domain": "Customer Experience",
            "business_function": "Customer Success",
            "budget_allocated": 1350000.0,
            "budget_spent": 1280000.0,
            "expected_roi": 125.0,
            "actual_roi": 118.0,
            "business_value_score": 9,
            "technical_feasibility_score": 8,
            "risk_score": 3,
            "strategic_alignment_score": 9,
            "start_date": datetime.utcnow() - timedelta(days=200),
            "target_completion_date": datetime.utcnow() - timedelta(days=20),
        },
        {
            "title": "Code Review Assistant",
            "description": "GenAI-powered code review and security vulnerability detection",
            "business_objective": "Improve code quality and reduce security vulnerabilities by 50%",
            "status": InitiativeStatus.PILOT,
            "priority": InitiativePriority.MEDIUM,
            "ai_type": AIType.GENAI,
            "strategic_domain": "Technology",
            "business_function": "Engineering",
            "budget_allocated": 750000.0,
            "budget_spent": 480000.0,
            "expected_roi": 70.0,
            "business_value_score": 7,
            "technical_feasibility_score": 9,
            "risk_score": 4,
            "strategic_alignment_score": 7,
            "start_date": datetime.utcnow() - timedelta(days=55),
            "target_completion_date": datetime.utcnow() + timedelta(days=75),
        },
        {
            "title": "Inventory Demand Forecasting",
            "description": "Predictive analytics for inventory demand forecasting and optimization",
            "business_objective": "Reduce inventory carrying costs by 25% while maintaining service levels",
            "status": InitiativeStatus.ON_HOLD,
            "priority": InitiativePriority.MEDIUM,
            "ai_type": AIType.PREDICTIVE,
            "strategic_domain": "Operations",
            "business_function": "Supply Chain",
            "budget_allocated": 920000.0,
            "budget_spent": 340000.0,
            "expected_roi": 62.0,
            "business_value_score": 7,
            "technical_feasibility_score": 7,
            "risk_score": 5,
            "strategic_alignment_score": 6,
            "start_date": datetime.utcnow() - timedelta(days=100),
            "target_completion_date": datetime.utcnow() + timedelta(days=200),
        },
        {
            "title": "Legal Document Analysis",
            "description": "GenAI for contract analysis and legal document review",
            "business_objective": "Reduce legal review time by 60% and improve accuracy",
            "status": InitiativeStatus.IDEATION,
            "priority": InitiativePriority.LOW,
            "ai_type": AIType.GENAI,
            "strategic_domain": "Risk Management",
            "business_function": "Legal",
            "budget_allocated": 1100000.0,
            "budget_spent": 80000.0,
            "expected_roi": 58.0,
            "business_value_score": 6,
            "technical_feasibility_score": 6,
            "risk_score": 7,
            "strategic_alignment_score": 6,
            "start_date": datetime.utcnow() - timedelta(days=10),
            "target_completion_date": datetime.utcnow() + timedelta(days=270),
        },
        {
            "title": "Price Optimization Engine",
            "description": "Dynamic pricing optimization using AI to maximize revenue",
            "business_objective": "Increase revenue by 15% through intelligent pricing strategies",
            "status": InitiativeStatus.PLANNING,
            "priority": InitiativePriority.HIGH,
            "ai_type": AIType.OPTIMIZATION,
            "strategic_domain": "Revenue Growth",
            "business_function": "Sales",
            "budget_allocated": 1650000.0,
            "budget_spent": 520000.0,
            "expected_roi": 92.0,
            "business_value_score": 8,
            "technical_feasibility_score": 7,
            "risk_score": 5,
            "strategic_alignment_score": 8,
            "start_date": datetime.utcnow() - timedelta(days=40),
            "target_completion_date": datetime.utcnow() + timedelta(days=140),
        },
        {
            "title": "Employee Sentiment Analysis",
            "description": "AI-powered analysis of employee feedback and sentiment tracking",
            "business_objective": "Improve employee satisfaction and reduce turnover by 20%",
            "status": InitiativeStatus.RETIRED,
            "priority": InitiativePriority.LOW,
            "ai_type": AIType.PREDICTIVE,
            "strategic_domain": "Human Resources",
            "business_function": "HR",
            "budget_allocated": 450000.0,
            "budget_spent": 420000.0,
            "expected_roi": 35.0,
            "actual_roi": 28.0,
            "business_value_score": 5,
            "technical_feasibility_score": 8,
            "risk_score": 6,
            "strategic_alignment_score": 5,
            "start_date": datetime.utcnow() - timedelta(days=300),
            "target_completion_date": datetime.utcnow() - timedelta(days=60),
            "actual_completion_date": datetime.utcnow() - timedelta(days=50),
        },
        {
            "title": "Network Security AI",
            "description": "AI-based network security monitoring and threat detection",
            "business_objective": "Detect and respond to security threats 10x faster",
            "status": InitiativeStatus.PRODUCTION,
            "priority": InitiativePriority.CRITICAL,
            "ai_type": AIType.PREDICTIVE,
            "strategic_domain": "Risk Management",
            "business_function": "IT Security",
            "budget_allocated": 2900000.0,
            "budget_spent": 2650000.0,
            "expected_roi": 135.0,
            "actual_roi": 130.0,
            "business_value_score": 10,
            "technical_feasibility_score": 8,
            "risk_score": 2,
            "strategic_alignment_score": 10,
            "start_date": datetime.utcnow() - timedelta(days=220),
            "target_completion_date": datetime.utcnow() - timedelta(days=10),
        },
        {
            "title": "Content Generation Platform",
            "description": "GenAI platform for automated marketing content creation",
            "business_objective": "Increase content production by 300% while reducing costs",
            "status": InitiativeStatus.PILOT,
            "priority": InitiativePriority.MEDIUM,
            "ai_type": AIType.GENAI,
            "strategic_domain": "Customer Experience",
            "business_function": "Marketing",
            "budget_allocated": 890000.0,
            "budget_spent": 620000.0,
            "expected_roi": 78.0,
            "business_value_score": 7,
            "technical_feasibility_score": 8,
            "risk_score": 4,
            "strategic_alignment_score": 7,
            "start_date": datetime.utcnow() - timedelta(days=65),
            "target_completion_date": datetime.utcnow() + timedelta(days=85),
        },
        {
            "title": "Warehouse Robotics Automation",
            "description": "AI-powered warehouse robotics for automated picking and packing",
            "business_objective": "Reduce warehouse labor costs by 45% and improve accuracy",
            "status": InitiativeStatus.IDEATION,
            "priority": InitiativePriority.HIGH,
            "ai_type": AIType.AUTOMATION,
            "strategic_domain": "Operations",
            "business_function": "Logistics",
            "budget_allocated": 4500000.0,
            "budget_spent": 320000.0,
            "expected_roi": 115.0,
            "business_value_score": 9,
            "technical_feasibility_score": 5,
            "risk_score": 7,
            "strategic_alignment_score": 8,
            "start_date": datetime.utcnow() - timedelta(days=25),
            "target_completion_date": datetime.utcnow() + timedelta(days=300),
        },
        {
            "title": "Voice of Customer Analytics",
            "description": "AI analysis of customer feedback across all channels",
            "business_objective": "Improve product development based on customer insights",
            "status": InitiativeStatus.ON_HOLD,
            "priority": InitiativePriority.LOW,
            "ai_type": AIType.PREDICTIVE,
            "strategic_domain": "Customer Experience",
            "business_function": "Product",
            "budget_allocated": 720000.0,
            "budget_spent": 280000.0,
            "expected_roi": 48.0,
            "business_value_score": 6,
            "technical_feasibility_score": 7,
            "risk_score": 5,
            "strategic_alignment_score": 6,
            "start_date": datetime.utcnow() - timedelta(days=80),
            "target_completion_date": datetime.utcnow() + timedelta(days=180),
        },
    ]
    
    # Create initiatives
    created_initiatives = []
    for init_data in initiatives_data:
        initiative = Initiative(
            owner_id=admin_user.id,
            **init_data
        )
        db.add(initiative)
        created_initiatives.append(initiative)
    
    db.commit()
    print(f"Created {len(created_initiatives)} initiatives")
    
    # Create risks for initiatives
    print("Creating risk records...")
    risks_data = [
        # High-risk initiatives
        {
            "initiative": created_initiatives[3],  # Supply Chain Optimization
            "title": "Data Integration Complexity",
            "description": "Multiple legacy systems need integration which may cause delays",
            "category": RiskCategory.TECHNICAL,
            "severity": RiskSeverity.HIGH,
            "status": RiskStatus.MITIGATING,
            "likelihood": 4,
            "impact": 4,
        },
        {
            "initiative": created_initiatives[8],  # Quality Control Vision System
            "title": "Hardware Compatibility Issues",
            "description": "Existing camera infrastructure may not support required AI processing",
            "category": RiskCategory.TECHNICAL,
            "severity": RiskSeverity.HIGH,
            "status": RiskStatus.IDENTIFIED,
            "likelihood": 4,
            "impact": 3,
        },
        {
            "initiative": created_initiatives[13],  # Legal Document Analysis
            "title": "Regulatory Compliance Risk",
            "description": "AI-generated legal analysis may not meet regulatory standards",
            "category": RiskCategory.COMPLIANCE,
            "severity": RiskSeverity.CRITICAL,
            "status": RiskStatus.ASSESSING,
            "likelihood": 3,
            "impact": 5,
        },
        {
            "initiative": created_initiatives[18],  # Warehouse Robotics
            "title": "High Capital Investment Risk",
            "description": "Significant upfront investment with uncertain ROI timeline",
            "category": RiskCategory.BUSINESS,
            "severity": RiskSeverity.HIGH,
            "status": RiskStatus.IDENTIFIED,
            "likelihood": 3,
            "impact": 4,
        },
        {
            "initiative": created_initiatives[0],  # Customer Service Chatbot
            "title": "Customer Acceptance Risk",
            "description": "Customers may prefer human interaction over AI chatbot",
            "category": RiskCategory.BUSINESS,
            "severity": RiskSeverity.MEDIUM,
            "status": RiskStatus.MONITORING,
            "likelihood": 3,
            "impact": 3,
        },
        {
            "initiative": created_initiatives[1],  # Predictive Maintenance
            "title": "Model Accuracy Concerns",
            "description": "Prediction accuracy may not meet required thresholds initially",
            "category": RiskCategory.TECHNICAL,
            "severity": RiskSeverity.MEDIUM,
            "status": RiskStatus.MITIGATING,
            "likelihood": 3,
            "impact": 3,
        },
        {
            "initiative": created_initiatives[2],  # Fraud Detection
            "title": "False Positive Rate",
            "description": "High false positive rate could impact customer experience",
            "category": RiskCategory.OPERATIONAL,
            "severity": RiskSeverity.LOW,
            "status": RiskStatus.RESOLVED,
            "likelihood": 2,
            "impact": 2,
        },
        {
            "initiative": created_initiatives[4],  # HR Recruitment
            "title": "Bias in AI Screening",
            "description": "AI model may exhibit unintended bias in candidate selection",
            "category": RiskCategory.ETHICAL,
            "severity": RiskSeverity.HIGH,
            "status": RiskStatus.MITIGATING,
            "likelihood": 3,
            "impact": 4,
        },
        {
            "initiative": created_initiatives[5],  # Marketing Campaign
            "title": "Data Privacy Compliance",
            "description": "Personalization may raise GDPR/CCPA compliance concerns",
            "category": RiskCategory.COMPLIANCE,
            "severity": RiskSeverity.MEDIUM,
            "status": RiskStatus.MONITORING,
            "likelihood": 2,
            "impact": 3,
        },
        {
            "initiative": created_initiatives[7],  # Sales Forecasting
            "title": "Change Management Resistance",
            "description": "Sales team may resist adoption of AI-driven forecasting",
            "category": RiskCategory.OPERATIONAL,
            "severity": RiskSeverity.MEDIUM,
            "status": RiskStatus.MITIGATING,
            "likelihood": 3,
            "impact": 2,
        },
        {
            "initiative": created_initiatives[10],  # Customer Churn
            "title": "Data Quality Issues",
            "description": "Incomplete customer data may affect prediction accuracy",
            "category": RiskCategory.TECHNICAL,
            "severity": RiskSeverity.LOW,
            "status": RiskStatus.RESOLVED,
            "likelihood": 2,
            "impact": 2,
        },
        {
            "initiative": created_initiatives[14],  # Price Optimization
            "title": "Market Reaction Uncertainty",
            "description": "Dynamic pricing may cause negative customer perception",
            "category": RiskCategory.REPUTATIONAL,
            "severity": RiskSeverity.MEDIUM,
            "status": RiskStatus.ASSESSING,
            "likelihood": 3,
            "impact": 3,
        },
    ]
    
    for risk_data in risks_data:
        initiative = risk_data.pop("initiative")
        risk = Risk(
            initiative_id=initiative.id,
            risk_score=risk_data["likelihood"] * risk_data["impact"],
            **risk_data
        )
        db.add(risk)
    
    db.commit()
    print(f"Created {len(risks_data)} risk records")
    
    # Print summary
    print("\n" + "="*60)
    print("ANALYTICS DATA SEEDING COMPLETE")
    print("="*60)
    print(f"Total Initiatives: {len(created_initiatives)}")
    print(f"Total Risks: {len(risks_data)}")
    print("\nStatus Distribution:")
    status_counts = {}
    for init in created_initiatives:
        status_counts[init.status.value] = status_counts.get(init.status.value, 0) + 1
    for status, count in sorted(status_counts.items()):
        print(f"  {status}: {count}")
    
    print("\nBudget Summary:")
    total_allocated = sum(i.budget_allocated for i in created_initiatives)
    total_spent = sum(i.budget_spent for i in created_initiatives)
    print(f"  Total Allocated: ${total_allocated:,.2f}")
    print(f"  Total Spent: ${total_spent:,.2f}")
    print(f"  Utilization: {(total_spent/total_allocated)*100:.1f}%")
    
    print("\nRisk Summary:")
    high_risk = sum(1 for r in risks_data if r["severity"] in [RiskSeverity.HIGH, RiskSeverity.CRITICAL])
    print(f"  High/Critical Risks: {high_risk}")
    print(f"  Medium/Low Risks: {len(risks_data) - high_risk}")
    print("="*60)


if __name__ == "__main__":
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        seed_analytics_data(db)
    finally:
        db.close()
