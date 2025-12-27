"""
Service layer for Module 6 - CAIO & Board Reporting
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json

from app.models.reporting import (
    ExecutiveDashboard, BoardReport, StrategyBrief, QuarterlyReport,
    ReportingMetric, NarrativeTemplate, ReportSchedule,
    DashboardType, ReportType, ReportStatus, MetricType
)
from app.models.initiative import Initiative
from app.models.benefits import BenefitRealization, ValueLeakage, KPIBaseline
from app.models.risk import Risk
from app.models.governance import GovernanceWorkflow, WorkflowStage
from app.schemas.reporting import (
    ValuePipelineData, DeliveredValueData, RiskExposureData,
    StageDistributionData, BottleneckData, PortfolioHealthData
)


class ReportingService:
    """Service for reporting and dashboard operations"""
    
    # ========================================================================
    # Dashboard Services
    # ========================================================================
    
    @staticmethod
    def calculate_value_pipeline(db: Session) -> ValuePipelineData:
        """Calculate value pipeline dashboard data"""
        
        # Get all initiatives with expected ROI
        initiatives = db.query(Initiative).filter(
            Initiative.expected_roi.isnot(None)
        ).all()
        
        # Calculate total pipeline value
        total_value = sum(
            (init.budget_allocated or 0) * (init.expected_roi or 0) / 100
            for init in initiatives
        )
        
        # By stage (status removed)
        by_stage = {}
        
        # By AI type
        by_ai_type = {}
        for init in initiatives:
            ai_type = init.ai_type.value if init.ai_type else "unknown"
            value = (init.budget_allocated or 0) * (init.expected_roi or 0) / 100
            by_ai_type[ai_type] = by_ai_type.get(ai_type, 0) + value
        
        # By risk tier (from governance workflow)
        by_risk_tier = {"low": 0, "medium": 0, "high": 0}
        for init in initiatives:
            workflow = db.query(GovernanceWorkflow).filter(
                GovernanceWorkflow.initiative_id == init.id
            ).first()
            if workflow:
                tier = workflow.risk_tier
                value = (init.budget_allocated or 0) * (init.expected_roi or 0) / 100
                by_risk_tier[tier] = by_risk_tier.get(tier, 0) + value
        
        # By strategic domain
        by_strategic_domain = {}
        for init in initiatives:
            domain = init.strategic_domain or "Unknown"
            value = (init.budget_allocated or 0) * (init.expected_roi or 0) / 100
            by_strategic_domain[domain] = by_strategic_domain.get(domain, 0) + value
        
        # Top initiatives by value
        top_initiatives = sorted(
            [
                {
                    "id": init.id,
                    "title": init.title,
                    "value": (init.budget_allocated or 0) * (init.expected_roi or 0) / 100,
                    "roi": init.expected_roi,
                }
                for init in initiatives
            ],
            key=lambda x: x["value"],
            reverse=True
        )[:10]
        
        # Trend data (mock for now - would need historical data)
        trend_data = []
        
        return ValuePipelineData(
            total_pipeline_value=total_value,
            by_stage=by_stage,
            by_ai_type=by_ai_type,
            by_risk_tier=by_risk_tier,
            by_strategic_domain=by_strategic_domain,
            top_initiatives=top_initiatives,
            trend_data=trend_data
        )
    
    @staticmethod
    def calculate_delivered_value(db: Session) -> DeliveredValueData:
        """Calculate delivered value dashboard data"""
        
        # Get all benefit realizations
        benefits = db.query(BenefitRealization).all()
        
        # Total delivered value
        total_delivered = sum(b.realized_value or 0 for b in benefits)
        
        # Realization rate
        total_expected = sum(b.expected_value or 0 for b in benefits)
        realization_rate = (total_delivered / total_expected * 100) if total_expected > 0 else 0
        
        # By benefit type
        by_benefit_type = {}
        for benefit in benefits:
            benefit_type = benefit.benefit_type.value
            by_benefit_type[benefit_type] = by_benefit_type.get(benefit_type, 0) + (benefit.realized_value or 0)
        
        # By initiative
        by_initiative = []
        initiatives = db.query(Initiative).all()
        for init in initiatives:
            init_benefits = [b for b in benefits if b.initiative_id == init.id]
            if init_benefits:
                by_initiative.append({
                    "id": init.id,
                    "title": init.title,
                    "delivered_value": sum(b.realized_value or 0 for b in init_benefits),
                    "expected_value": sum(b.expected_value or 0 for b in init_benefits),
                    "realization_rate": (
                        sum(b.realized_value or 0 for b in init_benefits) /
                        sum(b.expected_value or 0 for b in init_benefits) * 100
                        if sum(b.expected_value or 0 for b in init_benefits) > 0 else 0
                    )
                })
        
        # ROI metrics
        total_budget = sum(init.budget_allocated or 0 for init in initiatives)
        roi_metrics = {
            "total_investment": total_budget,
            "total_return": total_delivered,
            "roi_percentage": (total_delivered / total_budget * 100) if total_budget > 0 else 0
        }
        
        # Value leakage summary
        leakages = db.query(ValueLeakage).all()
        value_leakage_summary = {
            "total_leakages": len(leakages),
            "total_impact": sum(l.estimated_impact or 0 for l in leakages),
            "by_severity": {
                "critical": len([l for l in leakages if l.severity.value == "critical"]),
                "high": len([l for l in leakages if l.severity.value == "high"]),
                "medium": len([l for l in leakages if l.severity.value == "medium"]),
                "low": len([l for l in leakages if l.severity.value == "low"])
            }
        }
        
        return DeliveredValueData(
            total_delivered_value=total_delivered,
            realization_rate=realization_rate,
            by_benefit_type=by_benefit_type,
            by_initiative=by_initiative,
            roi_metrics=roi_metrics,
            value_leakage_summary=value_leakage_summary
        )
    
    @staticmethod
    def calculate_risk_exposure(db: Session) -> RiskExposureData:
        """Calculate risk exposure dashboard data"""
        
        # Get all risks
        risks = db.query(Risk).all()
        
        # Total risk score
        total_risk_score = sum(r.likelihood * r.impact for r in risks)
        
        # By category
        by_category = {}
        for risk in risks:
            category = risk.category.value
            risk_score = risk.likelihood * risk.impact
            by_category[category] = by_category.get(category, 0) + risk_score
        
        # By severity
        by_severity = {
            "critical": len([r for r in risks if r.severity.value == "critical"]),
            "high": len([r for r in risks if r.severity.value == "high"]),
            "medium": len([r for r in risks if r.severity.value == "medium"]),
            "low": len([r for r in risks if r.severity.value == "low"])
        }
        
        # High risk initiatives
        high_risk_initiatives = []
        initiatives = db.query(Initiative).all()
        for init in initiatives:
            init_risks = [r for r in risks if r.initiative_id == init.id]
            high_risks = [r for r in init_risks if r.severity.value in ["critical", "high"]]
            if high_risks:
                high_risk_initiatives.append({
                    "id": init.id,
                    "title": init.title,
                    "risk_count": len(high_risks),
                    "total_risk_score": sum(r.likelihood * r.impact for r in init_risks),
                    "highest_severity": max(r.severity.value for r in high_risks)
                })
        
        # Sort by risk score
        high_risk_initiatives.sort(key=lambda x: x["total_risk_score"], reverse=True)
        
        # Mitigation coverage
        risks_with_mitigations = len([r for r in risks if r.mitigations])
        mitigation_coverage = (risks_with_mitigations / len(risks) * 100) if risks else 0
        
        # Risk trends (mock for now)
        risk_trends = []
        
        return RiskExposureData(
            total_risk_score=total_risk_score,
            by_category=by_category,
            by_severity=by_severity,
            high_risk_initiatives=high_risk_initiatives[:10],
            mitigation_coverage=mitigation_coverage,
            risk_trends=risk_trends
        )
    
    @staticmethod
    def calculate_stage_distribution(db: Session) -> StageDistributionData:
        """Calculate stage distribution dashboard data"""
        
        # Get all initiatives
        initiatives = db.query(Initiative).all()
        
        # By stage (status removed)
        by_stage = {}
        
        # Average time in stage (mock - would need historical data)
        average_time_in_stage = {}
        
        # Bottlenecks (stages with >5 initiatives)
        bottlenecks = [
            {
                "stage": stage,
                "count": count,
                "severity": "high" if count > 10 else "medium" if count > 5 else "low"
            }
            for stage, count in by_stage.items()
            if count > 5
        ]
        
        # Approval rates by stage
        workflows = db.query(GovernanceWorkflow).all()
        approval_rates = {}
        for workflow in workflows:
            stages = db.query(WorkflowStage).filter(
                WorkflowStage.workflow_id == workflow.id
            ).all()
            for stage in stages:
                stage_name = stage.stage_name
                if stage_name not in approval_rates:
                    approval_rates[stage_name] = {"approved": 0, "total": 0}
                approval_rates[stage_name]["total"] += 1
                if stage.status == "completed":
                    approval_rates[stage_name]["approved"] += 1
        
        # Calculate percentages
        approval_rates = {
            stage: (data["approved"] / data["total"] * 100) if data["total"] > 0 else 0
            for stage, data in approval_rates.items()
        }
        
        # Velocity metrics (initiatives per month through each stage)
        velocity_metrics = {}
        
        return StageDistributionData(
            by_stage=by_stage,
            average_time_in_stage=average_time_in_stage,
            bottlenecks=bottlenecks,
            approval_rates=approval_rates,
            velocity_metrics=velocity_metrics
        )
    
    @staticmethod
    def identify_bottlenecks(db: Session) -> BottleneckData:
        """Identify portfolio bottlenecks"""
        
        # Resource bottlenecks (mock - would need resource allocation data)
        resource_bottlenecks = [
            {
                "resource": "Data Science Team",
                "overallocation": 150,
                "period": "Q1 2024",
                "affected_initiatives": 5
            }
        ]
        
        # Dependency bottlenecks
        dependency_bottlenecks = []
        initiatives = db.query(Initiative).all()
        # Would analyze initiative dependencies here
        
        # Approval bottlenecks (pending approvals > 30 days)
        approval_bottlenecks = []
        workflows = db.query(GovernanceWorkflow).filter(
            GovernanceWorkflow.status == "pending_approval"
        ).all()
        for workflow in workflows:
            stages = db.query(WorkflowStage).filter(
                and_(
                    WorkflowStage.workflow_id == workflow.id,
                    WorkflowStage.status == "pending_approval"
                )
            ).all()
            for stage in stages:
                days_pending = (datetime.utcnow() - stage.started_at).days if stage.started_at else 0
                if days_pending > 30:
                    approval_bottlenecks.append({
                        "initiative_id": workflow.initiative_id,
                        "stage": stage.stage_name,
                        "days_pending": days_pending,
                        "approver_role": stage.required_role
                    })
        
        # Data platform bottlenecks (mock)
        data_platform_bottlenecks = []
        
        # Vendor bottlenecks (mock)
        vendor_bottlenecks = []
        
        return BottleneckData(
            resource_bottlenecks=resource_bottlenecks,
            dependency_bottlenecks=dependency_bottlenecks,
            approval_bottlenecks=approval_bottlenecks,
            data_platform_bottlenecks=data_platform_bottlenecks,
            vendor_bottlenecks=vendor_bottlenecks
        )
    
    @staticmethod
    def calculate_portfolio_health(db: Session) -> PortfolioHealthData:
        """Calculate overall portfolio health"""
        
        # Get all initiatives
        initiatives = db.query(Initiative).all()
        active_initiatives = initiatives
        
        # Total budget
        total_budget = sum(i.budget_allocated or 0 for i in initiatives)
        
        # Total value delivered
        benefits = db.query(BenefitRealization).all()
        total_value_delivered = sum(b.realized_value or 0 for b in benefits)
        
        # Average ROI
        initiatives_with_roi = [i for i in initiatives if i.expected_roi]
        average_roi = (
            sum(i.expected_roi for i in initiatives_with_roi) / len(initiatives_with_roi)
            if initiatives_with_roi else 0
        )
        
        # Risk score
        risks = db.query(Risk).all()
        risk_score = sum(r.likelihood * r.impact for r in risks) / len(risks) if risks else 0
        
        # Compliance score (mock - would calculate from governance data)
        compliance_score = 85.0
        
        # Calculate health score (weighted average)
        health_score = (
            (min(average_roi / 50 * 100, 100) * 0.3) +  # ROI weight: 30%
            (max(100 - risk_score * 2, 0) * 0.3) +  # Risk weight: 30%
            (compliance_score * 0.2) +  # Compliance weight: 20%
            (min(len(active_initiatives) / 10 * 100, 100) * 0.2)  # Activity weight: 20%
        )
        
        # Key metrics
        key_metrics = {
            "initiatives_on_track": 0,
            "initiatives_at_risk": 0,
            "budget_utilization": (total_budget / 10000000 * 100) if total_budget else 0,  # Mock: $10M total budget
            "value_realization_rate": (total_value_delivered / total_budget * 100) if total_budget > 0 else 0,
        }
        
        return PortfolioHealthData(
            health_score=health_score,
            total_initiatives=len(initiatives),
            active_initiatives=len(active_initiatives),
            total_budget=total_budget,
            total_value_delivered=total_value_delivered,
            average_roi=average_roi,
            risk_score=risk_score,
            compliance_score=compliance_score,
            key_metrics=key_metrics
        )
    
    # ========================================================================
    # Report Generation Services
    # ========================================================================
    
    @staticmethod
    def generate_board_slides(
        db: Session,
        user_id: int,
        period_start: datetime,
        period_end: datetime,
        include_sections: Optional[List[str]] = None,
        template_id: Optional[int] = None
    ) -> BoardReport:
        """Generate board-ready slides"""
        
        # Gather data
        portfolio_health = ReportingService.calculate_portfolio_health(db)
        value_pipeline = ReportingService.calculate_value_pipeline(db)
        delivered_value = ReportingService.calculate_delivered_value(db)
        risk_exposure = ReportingService.calculate_risk_exposure(db)
        
        # Create report data structure
        report_data = {
            "portfolio_health": portfolio_health.dict(),
            "value_pipeline": value_pipeline.dict(),
            "delivered_value": delivered_value.dict(),
            "risk_exposure": risk_exposure.dict()
        }
        
        # Create key metrics
        key_metrics = {
            "health_score": portfolio_health.health_score,
            "total_value": value_pipeline.total_pipeline_value,
            "delivered_value": delivered_value.total_delivered_value,
            "risk_score": risk_exposure.total_risk_score
        }
        
        # Create board report
        report = BoardReport(
            title=f"Board Report - {period_start.strftime('%B %Y')}",
            report_type=ReportType.board_slides,
            status=ReportStatus.ready,
            key_metrics=key_metrics,
            report_data=report_data,
            period_start=period_start,
            period_end=period_end,
            generated_by=user_id,
            generated_at=datetime.utcnow(),
            ai_generated=False
        )
        
        db.add(report)
        db.commit()
        db.refresh(report)
        
        return report
    
    @staticmethod
    def generate_strategy_brief(
        db: Session,
        user_id: int,
        period_start: datetime,
        period_end: datetime,
        template_id: Optional[int] = None
    ) -> StrategyBrief:
        """Generate one-page AI strategy brief"""
        
        # Calculate portfolio health
        portfolio_health = ReportingService.calculate_portfolio_health(db)
        
        # Get top achievements (mock)
        top_achievements = [
            "Launched Customer Churn Prediction model - $1.2M value delivered",
            "Completed 5 high-risk governance reviews",
            "Achieved 85% compliance score across portfolio"
        ]
        
        # Get top risks
        risk_data = ReportingService.calculate_risk_exposure(db)
        top_risks = [
            f"{init['title']}: {init['risk_count']} high risks"
            for init in risk_data.high_risk_initiatives[:3]
        ]
        
        # Strategic recommendations (mock)
        strategic_recommendations = [
            "Increase GenAI investment from 20% to 35%",
            "Address resource bottleneck in Data Science team",
            "Accelerate governance reviews for 3 pending initiatives"
        ]
        
        # Next quarter priorities (mock)
        next_quarter_priorities = [
            "Launch 3 new GenAI initiatives",
            "Complete PIRs for 5 delivered initiatives",
            "Implement automated compliance monitoring"
        ]
        
        # Create strategy brief
        brief = StrategyBrief(
            title=f"AI Strategy Brief - {period_start.strftime('%B %Y')}",
            portfolio_health_score=portfolio_health.health_score,
            key_metrics=portfolio_health.key_metrics,
            top_achievements=top_achievements,
            top_risks=top_risks,
            strategic_recommendations=strategic_recommendations,
            next_quarter_priorities=next_quarter_priorities,
            period_start=period_start,
            period_end=period_end,
            generated_by=user_id,
            generated_at=datetime.utcnow(),
            ai_generated=False
        )
        
        db.add(brief)
        db.commit()
        db.refresh(brief)
        
        return brief
    
    @staticmethod
    def generate_quarterly_report(
        db: Session,
        user_id: int,
        quarter: str,
        year: int,
        include_sections: Optional[List[str]] = None,
        template_id: Optional[int] = None
    ) -> QuarterlyReport:
        """Generate quarterly AI impact report"""
        
        # Calculate metrics
        portfolio_health = ReportingService.calculate_portfolio_health(db)
        value_data = ReportingService.calculate_delivered_value(db)
        risk_data = ReportingService.calculate_risk_exposure(db)
        
        # Create report sections
        portfolio_performance = {
            "health_score": portfolio_health.health_score,
            "total_initiatives": portfolio_health.total_initiatives,
            "active_initiatives": portfolio_health.active_initiatives
        }
        
        value_realization = {
            "total_delivered": value_data.total_delivered_value,
            "realization_rate": value_data.realization_rate,
            "by_type": value_data.by_benefit_type
        }
        
        risk_management = {
            "total_risk_score": risk_data.total_risk_score,
            "by_category": risk_data.by_category,
            "mitigation_coverage": risk_data.mitigation_coverage
        }
        
        governance_compliance = {
            "compliance_score": portfolio_health.compliance_score,
            "completed_reviews": 12,  # Mock
            "pending_reviews": 3  # Mock
        }
        
        # Create quarterly report
        report = QuarterlyReport(
            title=f"Quarterly AI Impact Report - {quarter} {year}",
            quarter=quarter,
            year=year,
            portfolio_performance=portfolio_performance,
            value_realization=value_realization,
            risk_management=risk_management,
            governance_compliance=governance_compliance,
            total_initiatives=portfolio_health.total_initiatives,
            total_value_delivered=value_data.total_delivered_value,
            total_budget_spent=portfolio_health.total_budget,
            average_roi=portfolio_health.average_roi,
            risk_score=risk_data.total_risk_score,
            generated_by=user_id,
            generated_at=datetime.utcnow(),
            ai_generated=False
        )
        
        db.add(report)
        db.commit()
        db.refresh(report)
        
        return report


# Singleton instance
reporting_service = ReportingService()
