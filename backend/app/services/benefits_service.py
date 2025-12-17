from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.benefits import (
    KPIBaseline, KPIMeasurement, BenefitRealization, BenefitConfidenceScore,
    ValueLeakage, PostImplementationReview, BenefitStatus, PIRStatus
)
from app.models.initiative import Initiative
from app.schemas.benefits import (
    KPIBaselineCreate, KPIBaselineUpdate, KPIMeasurementCreate,
    BenefitRealizationCreate, BenefitRealizationUpdate,
    BenefitConfidenceScoreCreate, ValueLeakageCreate, ValueLeakageUpdate,
    PostImplementationReviewCreate, PostImplementationReviewUpdate,
    BenefitsSummary, KPITrend, InitiativeDashboard, PortfolioDashboard
)


class BenefitsService:
    """Service for managing benefits realization and value tracking"""

    # KPI Baseline Methods
    @staticmethod
    def create_kpi_baseline(db: Session, kpi_data: KPIBaselineCreate) -> KPIBaseline:
        """Create a new KPI baseline"""
        kpi = KPIBaseline(**kpi_data.model_dump())
        db.add(kpi)
        db.commit()
        db.refresh(kpi)
        return kpi

    @staticmethod
    def get_kpi_baseline(db: Session, kpi_id: int) -> Optional[KPIBaseline]:
        """Get a KPI baseline by ID"""
        return db.query(KPIBaseline).filter(KPIBaseline.id == kpi_id).first()

    @staticmethod
    def get_initiative_kpis(db: Session, initiative_id: int) -> List[KPIBaseline]:
        """Get all KPIs for an initiative"""
        return db.query(KPIBaseline).filter(KPIBaseline.initiative_id == initiative_id).all()

    @staticmethod
    def update_kpi_baseline(db: Session, kpi_id: int, kpi_data: KPIBaselineUpdate) -> Optional[KPIBaseline]:
        """Update a KPI baseline"""
        kpi = db.query(KPIBaseline).filter(KPIBaseline.id == kpi_id).first()
        if not kpi:
            return None
        
        update_data = kpi_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(kpi, field, value)
        
        db.commit()
        db.refresh(kpi)
        return kpi

    # KPI Measurement Methods
    @staticmethod
    def record_kpi_measurement(db: Session, measurement_data: KPIMeasurementCreate) -> KPIMeasurement:
        """Record a new KPI measurement"""
        measurement = KPIMeasurement(**measurement_data.model_dump())
        db.add(measurement)
        db.commit()
        db.refresh(measurement)
        return measurement

    @staticmethod
    def get_kpi_measurements(db: Session, kpi_id: int) -> List[KPIMeasurement]:
        """Get all measurements for a KPI"""
        return db.query(KPIMeasurement).filter(
            KPIMeasurement.kpi_baseline_id == kpi_id
        ).order_by(KPIMeasurement.measurement_date.desc()).all()

    @staticmethod
    def get_kpi_trend(db: Session, kpi_id: int) -> Optional[KPITrend]:
        """Get trend analysis for a KPI"""
        kpi = db.query(KPIBaseline).filter(KPIBaseline.id == kpi_id).first()
        if not kpi:
            return None
        
        measurements = db.query(KPIMeasurement).filter(
            KPIMeasurement.kpi_baseline_id == kpi_id
        ).order_by(KPIMeasurement.measurement_date.asc()).all()
        
        if not measurements:
            current_value = kpi.baseline_value
        else:
            current_value = measurements[-1].actual_value
        
        # Calculate progress percentage
        if kpi.target_value != kpi.baseline_value:
            progress = ((current_value - kpi.baseline_value) / 
                       (kpi.target_value - kpi.baseline_value)) * 100
        else:
            progress = 100.0 if current_value == kpi.target_value else 0.0
        
        # Determine trend
        if len(measurements) >= 2:
            recent_trend = measurements[-1].actual_value - measurements[-2].actual_value
            if abs(recent_trend) < 0.01:
                trend = "stable"
            elif (kpi.target_value > kpi.baseline_value and recent_trend > 0) or \
                 (kpi.target_value < kpi.baseline_value and recent_trend < 0):
                trend = "improving"
            else:
                trend = "declining"
        else:
            trend = "stable"
        
        return KPITrend(
            kpi_id=kpi.id,
            kpi_name=kpi.name,
            baseline_value=kpi.baseline_value,
            target_value=kpi.target_value,
            current_value=current_value,
            unit=kpi.unit,
            progress_percentage=progress,
            trend=trend,
            measurements=measurements
        )

    # Benefit Realization Methods
    @staticmethod
    def create_benefit(db: Session, benefit_data: BenefitRealizationCreate) -> BenefitRealization:
        """Create a new benefit realization"""
        benefit = BenefitRealization(**benefit_data.model_dump())
        db.add(benefit)
        db.commit()
        db.refresh(benefit)
        return benefit

    @staticmethod
    def get_benefit(db: Session, benefit_id: int) -> Optional[BenefitRealization]:
        """Get a benefit by ID"""
        return db.query(BenefitRealization).filter(BenefitRealization.id == benefit_id).first()

    @staticmethod
    def get_initiative_benefits(db: Session, initiative_id: int) -> List[BenefitRealization]:
        """Get all benefits for an initiative"""
        return db.query(BenefitRealization).filter(
            BenefitRealization.initiative_id == initiative_id
        ).all()

    @staticmethod
    def update_benefit(db: Session, benefit_id: int, benefit_data: BenefitRealizationUpdate) -> Optional[BenefitRealization]:
        """Update a benefit realization"""
        benefit = db.query(BenefitRealization).filter(BenefitRealization.id == benefit_id).first()
        if not benefit:
            return None
        
        update_data = benefit_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(benefit, field, value)
        
        db.commit()
        db.refresh(benefit)
        return benefit

    @staticmethod
    def get_benefits_summary(db: Session, initiative_id: int) -> BenefitsSummary:
        """Get benefits summary for an initiative"""
        benefits = db.query(BenefitRealization).filter(
            BenefitRealization.initiative_id == initiative_id
        ).all()
        
        total_expected = sum(b.expected_value for b in benefits)
        total_realized = sum(b.realized_value for b in benefits)
        realization_pct = (total_realized / total_expected * 100) if total_expected > 0 else 0
        
        # Group by type
        by_type = {}
        for benefit in benefits:
            type_key = benefit.benefit_type.value
            if type_key not in by_type:
                by_type[type_key] = {"expected": 0, "realized": 0}
            by_type[type_key]["expected"] += benefit.expected_value
            by_type[type_key]["realized"] += benefit.realized_value
        
        # Group by status
        by_status = {}
        for benefit in benefits:
            status_key = benefit.status.value
            by_status[status_key] = by_status.get(status_key, 0) + 1
        
        # At-risk benefits
        at_risk = [b for b in benefits if b.status == BenefitStatus.AT_RISK]
        
        return BenefitsSummary(
            total_expected_value=total_expected,
            total_realized_value=total_realized,
            realization_percentage=realization_pct,
            benefits_by_type=by_type,
            benefits_by_status=by_status,
            at_risk_benefits=at_risk
        )

    # Confidence Score Methods
    @staticmethod
    def score_benefit_confidence(db: Session, score_data: BenefitConfidenceScoreCreate) -> BenefitConfidenceScore:
        """Record a benefit confidence score"""
        score = BenefitConfidenceScore(**score_data.model_dump())
        db.add(score)
        db.commit()
        db.refresh(score)
        return score

    @staticmethod
    def get_confidence_scores(db: Session, benefit_id: int) -> List[BenefitConfidenceScore]:
        """Get all confidence scores for a benefit"""
        return db.query(BenefitConfidenceScore).filter(
            BenefitConfidenceScore.benefit_realization_id == benefit_id
        ).order_by(BenefitConfidenceScore.score_date.desc()).all()

    # Value Leakage Methods
    @staticmethod
    def report_value_leakage(db: Session, leakage_data: ValueLeakageCreate) -> ValueLeakage:
        """Report a new value leakage"""
        leakage = ValueLeakage(**leakage_data.model_dump())
        db.add(leakage)
        db.commit()
        db.refresh(leakage)
        return leakage

    @staticmethod
    def get_leakage(db: Session, leakage_id: int) -> Optional[ValueLeakage]:
        """Get a value leakage by ID"""
        return db.query(ValueLeakage).filter(ValueLeakage.id == leakage_id).first()

    @staticmethod
    def get_initiative_leakages(db: Session, initiative_id: int) -> List[ValueLeakage]:
        """Get all value leakages for an initiative"""
        return db.query(ValueLeakage).filter(
            ValueLeakage.initiative_id == initiative_id
        ).all()

    @staticmethod
    def update_leakage(db: Session, leakage_id: int, leakage_data: ValueLeakageUpdate) -> Optional[ValueLeakage]:
        """Update a value leakage"""
        leakage = db.query(ValueLeakage).filter(ValueLeakage.id == leakage_id).first()
        if not leakage:
            return None
        
        update_data = leakage_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(leakage, field, value)
        
        db.commit()
        db.refresh(leakage)
        return leakage

    # Post-Implementation Review Methods
    @staticmethod
    def create_pir(db: Session, pir_data: PostImplementationReviewCreate) -> PostImplementationReview:
        """Create a new post-implementation review"""
        pir = PostImplementationReview(**pir_data.model_dump())
        db.add(pir)
        db.commit()
        db.refresh(pir)
        return pir

    @staticmethod
    def get_pir(db: Session, pir_id: int) -> Optional[PostImplementationReview]:
        """Get a PIR by ID"""
        return db.query(PostImplementationReview).filter(PostImplementationReview.id == pir_id).first()

    @staticmethod
    def get_initiative_pirs(db: Session, initiative_id: int) -> List[PostImplementationReview]:
        """Get all PIRs for an initiative"""
        return db.query(PostImplementationReview).filter(
            PostImplementationReview.initiative_id == initiative_id
        ).all()

    @staticmethod
    def update_pir(db: Session, pir_id: int, pir_data: PostImplementationReviewUpdate) -> Optional[PostImplementationReview]:
        """Update a PIR"""
        pir = db.query(PostImplementationReview).filter(PostImplementationReview.id == pir_id).first()
        if not pir:
            return None
        
        update_data = pir_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(pir, field, value)
        
        db.commit()
        db.refresh(pir)
        return pir

    @staticmethod
    def submit_pir(db: Session, pir_id: int) -> Optional[PostImplementationReview]:
        """Submit a PIR for review"""
        pir = db.query(PostImplementationReview).filter(PostImplementationReview.id == pir_id).first()
        if not pir:
            return None
        
        pir.status = PIRStatus.IN_REVIEW
        pir.submitted_date = datetime.utcnow()
        db.commit()
        db.refresh(pir)
        return pir

    # Dashboard Methods
    @staticmethod
    def get_initiative_dashboard(db: Session, initiative_id: int) -> Optional[InitiativeDashboard]:
        """Get comprehensive dashboard for an initiative"""
        initiative = db.query(Initiative).filter(Initiative.id == initiative_id).first()
        if not initiative:
            return None
        
        kpis = BenefitsService.get_initiative_kpis(db, initiative_id)
        kpi_trends = [BenefitsService.get_kpi_trend(db, kpi.id) for kpi in kpis]
        kpi_trends = [t for t in kpi_trends if t is not None]
        
        benefits = BenefitsService.get_initiative_benefits(db, initiative_id)
        benefits_summary = BenefitsService.get_benefits_summary(db, initiative_id)
        leakages = BenefitsService.get_initiative_leakages(db, initiative_id)
        pirs = BenefitsService.get_initiative_pirs(db, initiative_id)
        
        return InitiativeDashboard(
            initiative_id=initiative.id,
            initiative_name=initiative.title,
            kpis=kpis,
            kpi_trends=kpi_trends,
            benefits=benefits,
            benefits_summary=benefits_summary,
            leakages=leakages,
            recent_pirs=pirs[:5]  # Last 5 PIRs
        )

    @staticmethod
    def get_portfolio_dashboard(db: Session) -> PortfolioDashboard:
        """Get portfolio-wide benefits dashboard"""
        initiatives = db.query(Initiative).all()
        
        total_expected = 0
        total_realized = 0
        initiatives_by_status = {}
        top_performing = []
        at_risk = []
        
        for initiative in initiatives:
            benefits = BenefitsService.get_initiative_benefits(db, initiative.id)
            expected = sum(b.expected_value for b in benefits)
            realized = sum(b.realized_value for b in benefits)
            
            total_expected += expected
            total_realized += realized
            
            status_key = initiative.status.value
            initiatives_by_status[status_key] = initiatives_by_status.get(status_key, 0) + 1
            
            if expected > 0:
                realization_rate = (realized / expected) * 100
                initiative_data = {
                    "id": initiative.id,
                    "name": initiative.title,
                    "expected_value": expected,
                    "realized_value": realized,
                    "realization_rate": realization_rate
                }
                
                if realization_rate >= 80:
                    top_performing.append(initiative_data)
                elif realization_rate < 50:
                    at_risk.append(initiative_data)
        
        # Sort and limit
        top_performing.sort(key=lambda x: x["realization_rate"], reverse=True)
        at_risk.sort(key=lambda x: x["realization_rate"])
        
        # Leakage statistics
        all_leakages = db.query(ValueLeakage).all()
        leakages_by_severity = {}
        for leakage in all_leakages:
            severity_key = leakage.severity.value
            leakages_by_severity[severity_key] = leakages_by_severity.get(severity_key, 0) + 1
        
        overall_rate = (total_realized / total_expected * 100) if total_expected > 0 else 0
        
        return PortfolioDashboard(
            total_initiatives=len(initiatives),
            total_expected_value=total_expected,
            total_realized_value=total_realized,
            overall_realization_rate=overall_rate,
            initiatives_by_status=initiatives_by_status,
            top_performing_initiatives=top_performing[:10],
            at_risk_initiatives=at_risk[:10],
            total_leakages=len(all_leakages),
            leakages_by_severity=leakages_by_severity
        )
