from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from app.models.scoring import (
    ScoringModelVersion, ScoringDimension, ScoringCriteria, 
    InitiativeScore, DimensionType
)
from app.models.initiative import Initiative
from app.services.openai_service import openai_service
import json
from datetime import datetime


class ScoringService:
    """Service for calculating initiative scores and managing scoring models."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_active_scoring_model(self) -> Optional[ScoringModelVersion]:
        """Get the currently active scoring model."""
        return self.db.query(ScoringModelVersion).filter(
            ScoringModelVersion.is_active == True
        ).first()
    
    def calculate_dimension_score(
        self, 
        initiative: Initiative, 
        dimension: ScoringDimension,
        ai_insights: Optional[Dict[str, Any]] = None
    ) -> float:
        """
        Calculate score for a specific dimension based on its criteria.
        
        Args:
            initiative: The initiative to score
            dimension: The scoring dimension
            ai_insights: Optional AI-generated insights for scoring
            
        Returns:
            Dimension score (0-10)
        """
        if not dimension.criteria:
            return 0.0
        
        total_weight = sum(c.weight for c in dimension.criteria)
        if total_weight == 0:
            return 0.0
        
        weighted_score = 0.0
        
        for criteria in dimension.criteria:
            # Get score for this criteria
            score = self._calculate_criteria_score(initiative, criteria, ai_insights)
            
            # Apply weight
            weighted_score += score * (criteria.weight / total_weight)
        
        return round(weighted_score, 2)
    
    def _calculate_criteria_score(
        self, 
        initiative: Initiative, 
        criteria: ScoringCriteria,
        ai_insights: Optional[Dict[str, Any]] = None
    ) -> float:
        """Calculate score for a specific criteria."""
        score = 0.0
        
        # Try to get score from initiative data
        if criteria.data_source_field:
            field_value = getattr(initiative, criteria.data_source_field, None)
            if field_value is not None:
                # Normalize to 0-10 scale
                if criteria.criteria_type == "numeric":
                    score = float(field_value)
                elif criteria.criteria_type == "percentage":
                    score = float(field_value) / 10.0  # Convert 0-100 to 0-10
                elif criteria.criteria_type == "boolean":
                    score = 10.0 if field_value else 0.0
        
        # Try to get score from AI insights
        elif ai_insights and criteria.name in ai_insights:
            score = float(ai_insights[criteria.name])
        
        # Apply inversion if needed (e.g., for complexity where lower is better)
        if criteria.is_inverted:
            score = criteria.max_value - score
        
        # Clamp to min/max
        score = max(criteria.min_value, min(criteria.max_value, score))
        
        return score
    
    async def calculate_initiative_score(
        self, 
        initiative_id: int,
        user_id: int,
        use_ai: bool = True,
        manual_scores: Optional[Dict[str, float]] = None
    ) -> InitiativeScore:
        """
        Calculate comprehensive score for an initiative.
        
        Args:
            initiative_id: ID of the initiative
            user_id: ID of the user performing calculation
            use_ai: Whether to use AI for scoring assistance
            manual_scores: Optional manual score overrides
            
        Returns:
            InitiativeScore object
        """
        # Get initiative
        initiative = self.db.query(Initiative).filter(Initiative.id == initiative_id).first()
        if not initiative:
            raise ValueError(f"Initiative {initiative_id} not found")
        
        # Get active scoring model
        model = self.get_active_scoring_model()
        if not model:
            raise ValueError("No active scoring model found")
        
        # Get AI insights if requested
        ai_insights = None
        ai_justification = None
        strengths = []
        weaknesses = []
        recommendations = []
        confidence = None
        
        if use_ai:
            ai_result = await self._get_ai_scoring_insights(initiative, model)
            if ai_result.get("success"):
                data = json.loads(ai_result["data"])
                ai_insights = data.get("scores", {})
                ai_justification = data.get("justification", "")
                strengths = data.get("strengths", [])
                weaknesses = data.get("weaknesses", [])
                recommendations = data.get("recommendations", [])
                confidence = data.get("confidence", 80)
        
        # Calculate dimension scores
        dimension_scores = {}
        criteria_scores = {}
        
        for dimension in model.dimensions:
            if manual_scores and dimension.dimension_type.value in manual_scores:
                # Use manual override
                score = manual_scores[dimension.dimension_type.value]
            else:
                # Calculate from criteria
                score = self.calculate_dimension_score(initiative, dimension, ai_insights)
            
            dimension_scores[dimension.dimension_type.value] = score
            
            # Store individual criteria scores
            for criteria in dimension.criteria:
                criteria_score = self._calculate_criteria_score(initiative, criteria, ai_insights)
                criteria_scores[str(criteria.id)] = criteria_score
        
        # Calculate overall weighted score
        overall_score = 0.0
        if "value" in dimension_scores:
            overall_score += dimension_scores["value"] * (model.value_weight / 100)
        if "feasibility" in dimension_scores:
            overall_score += dimension_scores["feasibility"] * (model.feasibility_weight / 100)
        if "risk" in dimension_scores:
            overall_score += dimension_scores["risk"] * (model.risk_weight / 100)
        if "strategic_alignment" in dimension_scores:
            overall_score += dimension_scores["strategic_alignment"] * (model.strategic_alignment_weight / 100)
        
        overall_score = round(overall_score, 2)
        
        # Create or update score record
        existing_score = self.db.query(InitiativeScore).filter(
            InitiativeScore.initiative_id == initiative_id,
            InitiativeScore.model_version_id == model.id
        ).first()
        
        if existing_score:
            # Update existing
            existing_score.overall_score = overall_score
            existing_score.value_score = dimension_scores.get("value", 0.0)
            existing_score.feasibility_score = dimension_scores.get("feasibility", 0.0)
            existing_score.risk_score = dimension_scores.get("risk", 0.0)
            existing_score.strategic_alignment_score = dimension_scores.get("strategic_alignment", 0.0)
            existing_score.criteria_scores = criteria_scores
            existing_score.score_justification = ai_justification
            existing_score.strengths = strengths
            existing_score.weaknesses = weaknesses
            existing_score.recommendations = recommendations
            existing_score.confidence_score = confidence
            existing_score.calculation_method = "ai" if use_ai else "manual"
            existing_score.calculated_at = datetime.utcnow()
            existing_score.calculated_by_id = user_id
            score_record = existing_score
        else:
            # Create new
            score_record = InitiativeScore(
                initiative_id=initiative_id,
                model_version_id=model.id,
                overall_score=overall_score,
                value_score=dimension_scores.get("value", 0.0),
                feasibility_score=dimension_scores.get("feasibility", 0.0),
                risk_score=dimension_scores.get("risk", 0.0),
                strategic_alignment_score=dimension_scores.get("strategic_alignment", 0.0),
                criteria_scores=criteria_scores,
                score_justification=ai_justification,
                strengths=strengths,
                weaknesses=weaknesses,
                recommendations=recommendations,
                confidence_score=confidence,
                calculation_method="ai" if use_ai else "manual",
                calculated_by_id=user_id
            )
            self.db.add(score_record)
        
        self.db.commit()
        self.db.refresh(score_record)
        
        # Update rankings
        self._update_rankings(model.id)
        
        return score_record
    
    async def _get_ai_scoring_insights(
        self, 
        initiative: Initiative, 
        model: ScoringModelVersion
    ) -> Dict[str, Any]:
        """Get AI-powered scoring insights for an initiative."""
        initiative_data = {
            "title": initiative.title,
            "description": initiative.description,
            "business_objective": initiative.business_objective,
            "ai_type": initiative.ai_type.value if initiative.ai_type else None,
            "strategic_domain": initiative.strategic_domain,
            "business_function": initiative.business_function,
            "technologies": initiative.technologies,
            "data_sources": initiative.data_sources,
            "expected_roi": initiative.expected_roi,
            "budget_allocated": initiative.budget_allocated,
            "stakeholders": initiative.stakeholders
        }
        
        # Get dimension details for context
        dimensions_info = []
        for dim in model.dimensions:
            criteria_info = [
                {
                    "name": c.name,
                    "description": c.description,
                    "weight": c.weight,
                    "help_text": c.help_text
                }
                for c in dim.criteria
            ]
            dimensions_info.append({
                "type": dim.dimension_type.value,
                "name": dim.name,
                "description": dim.description,
                "criteria": criteria_info
            })
        
        return await openai_service.calculate_initiative_scores(
            initiative_data, 
            dimensions_info
        )
    
    def _update_rankings(self, model_version_id: int):
        """Update priority rankings for all initiatives using this model."""
        scores = self.db.query(InitiativeScore).filter(
            InitiativeScore.model_version_id == model_version_id
        ).order_by(InitiativeScore.overall_score.desc()).all()
        
        for rank, score in enumerate(scores, start=1):
            score.priority_rank = rank
        
        self.db.commit()
    
    async def calculate_all_scores(self, user_id: int, use_ai: bool = True):
        """Recalculate scores for all initiatives."""
        initiatives = self.db.query(Initiative).all()
        results = []
        
        for initiative in initiatives:
            try:
                score = await self.calculate_initiative_score(
                    initiative.id, 
                    user_id, 
                    use_ai=use_ai
                )
                results.append({"initiative_id": initiative.id, "success": True, "score": score})
            except Exception as e:
                results.append({"initiative_id": initiative.id, "success": False, "error": str(e)})
        
        return results
    
    def get_initiative_score_history(self, initiative_id: int) -> List[InitiativeScore]:
        """Get score history for an initiative."""
        return self.db.query(InitiativeScore).filter(
            InitiativeScore.initiative_id == initiative_id
        ).order_by(InitiativeScore.calculated_at.desc()).all()
    
    def get_portfolio_rankings(
        self, 
        model_version_id: Optional[int] = None,
        limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get ranked list of initiatives."""
        if not model_version_id:
            model = self.get_active_scoring_model()
            if not model:
                return []
            model_version_id = model.id
        
        query = self.db.query(InitiativeScore, Initiative).join(
            Initiative, InitiativeScore.initiative_id == Initiative.id
        ).filter(
            InitiativeScore.model_version_id == model_version_id
        ).order_by(InitiativeScore.priority_rank.asc())
        
        if limit:
            query = query.limit(limit)
        
        results = []
        for score, initiative in query.all():
            results.append({
                "initiative_id": initiative.id,
                "title": initiative.title,
                "rank": score.priority_rank,
                "overall_score": score.overall_score,
                "value_score": score.value_score,
                "feasibility_score": score.feasibility_score,
                "risk_score": score.risk_score,
                "strategic_alignment_score": score.strategic_alignment_score,
                "justification": score.score_justification,
                "ai_type": initiative.ai_type.value if initiative.ai_type else None
            })
        
        return results
