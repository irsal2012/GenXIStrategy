"""
AI Project Management Service Layer - Module 7
Business logic for AI project lifecycle management
"""
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.models.ai_project import (
    BusinessUnderstanding, DataUnderstanding, DataPreparation,
    ModelDevelopment, ModelEvaluation, ModelDeployment, ModelMonitoring,
    GoNoGoDecision, DataFeasibilityStatus, PipelineStatus, ModelStatus,
    DeploymentStatus, MonitoringStatus
)
from app.schemas.ai_project import (
    BusinessUnderstandingCreate, BusinessUnderstandingUpdate,
    DataUnderstandingCreate, DataUnderstandingUpdate,
    DataPreparationCreate, DataPreparationUpdate,
    ModelDevelopmentCreate, ModelDevelopmentUpdate,
    ModelEvaluationCreate, ModelEvaluationUpdate,
    ModelDeploymentCreate, ModelDeploymentUpdate,
    ModelMonitoringCreate,
    ProjectOverviewDashboard, PhaseProgressSummary
)


class AIProjectService:
    """Service for AI Project Management operations"""

    # ==================== Business Understanding ====================
    
    @staticmethod
    def create_business_understanding(
        db: Session,
        business_understanding: BusinessUnderstandingCreate,
        user_id: int
    ) -> BusinessUnderstanding:
        """Create business understanding for an initiative"""
        db_business_understanding = BusinessUnderstanding(
            **business_understanding.dict(),
            created_by=user_id
        )
        db.add(db_business_understanding)
        db.commit()
        db.refresh(db_business_understanding)
        return db_business_understanding

    @staticmethod
    def get_business_understanding_by_initiative(
        db: Session,
        initiative_id: int
    ) -> Optional[BusinessUnderstanding]:
        """Get business understanding for an initiative"""
        return db.query(BusinessUnderstanding).filter(
            BusinessUnderstanding.initiative_id == initiative_id
        ).first()

    @staticmethod
    def update_business_understanding(
        db: Session,
        business_understanding_id: int,
        business_understanding_update: BusinessUnderstandingUpdate
    ) -> Optional[BusinessUnderstanding]:
        """Update business understanding"""
        db_business_understanding = db.query(BusinessUnderstanding).filter(
            BusinessUnderstanding.id == business_understanding_id
        ).first()
        
        if not db_business_understanding:
            return None
        
        update_data = business_understanding_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_business_understanding, field, value)
        
        db.commit()
        db.refresh(db_business_understanding)
        return db_business_understanding

    @staticmethod
    def record_go_no_go_decision(
        db: Session,
        business_understanding_id: int,
        decision: str,
        rationale: str,
        user_id: int
    ) -> Optional[BusinessUnderstanding]:
        """Record Go/No-Go decision"""
        db_business_understanding = db.query(BusinessUnderstanding).filter(
            BusinessUnderstanding.id == business_understanding_id
        ).first()
        
        if not db_business_understanding:
            return None
        
        db_business_understanding.go_no_go_decision = decision
        db_business_understanding.go_no_go_rationale = rationale
        db_business_understanding.decision_date = datetime.utcnow()
        db_business_understanding.decision_by = user_id
        
        db.commit()
        db.refresh(db_business_understanding)
        return db_business_understanding

    # ==================== Data Understanding ====================
    
    @staticmethod
    def create_data_understanding(
        db: Session,
        data_understanding: DataUnderstandingCreate,
        user_id: int
    ) -> DataUnderstanding:
        """Create data understanding record"""
        db_data_understanding = DataUnderstanding(
            **data_understanding.dict(),
            created_by=user_id
        )
        db.add(db_data_understanding)
        db.commit()
        db.refresh(db_data_understanding)
        return db_data_understanding

    @staticmethod
    def get_data_understanding_by_initiative(
        db: Session,
        initiative_id: int
    ) -> List[DataUnderstanding]:
        """Get all data understanding records for an initiative"""
        return db.query(DataUnderstanding).filter(
            DataUnderstanding.initiative_id == initiative_id
        ).all()

    @staticmethod
    def get_data_understanding(
        db: Session,
        data_understanding_id: int
    ) -> Optional[DataUnderstanding]:
        """Get specific data understanding record"""
        return db.query(DataUnderstanding).filter(
            DataUnderstanding.id == data_understanding_id
        ).first()

    @staticmethod
    def update_data_understanding(
        db: Session,
        data_understanding_id: int,
        data_understanding_update: DataUnderstandingUpdate
    ) -> Optional[DataUnderstanding]:
        """Update data understanding"""
        db_data_understanding = db.query(DataUnderstanding).filter(
            DataUnderstanding.id == data_understanding_id
        ).first()
        
        if not db_data_understanding:
            return None
        
        update_data = data_understanding_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_data_understanding, field, value)
        
        db.commit()
        db.refresh(db_data_understanding)
        return db_data_understanding

    # ==================== Data Preparation ====================
    
    @staticmethod
    def create_data_preparation(
        db: Session,
        data_preparation: DataPreparationCreate,
        user_id: int
    ) -> DataPreparation:
        """Create data preparation step"""
        db_data_preparation = DataPreparation(
            **data_preparation.dict(),
            created_by=user_id
        )
        db.add(db_data_preparation)
        db.commit()
        db.refresh(db_data_preparation)
        return db_data_preparation

    @staticmethod
    def get_data_preparation_by_initiative(
        db: Session,
        initiative_id: int
    ) -> List[DataPreparation]:
        """Get all data preparation steps for an initiative"""
        return db.query(DataPreparation).filter(
            DataPreparation.initiative_id == initiative_id
        ).order_by(DataPreparation.step_order).all()

    @staticmethod
    def get_data_preparation(
        db: Session,
        data_preparation_id: int
    ) -> Optional[DataPreparation]:
        """Get specific data preparation step"""
        return db.query(DataPreparation).filter(
            DataPreparation.id == data_preparation_id
        ).first()

    @staticmethod
    def update_data_preparation(
        db: Session,
        data_preparation_id: int,
        data_preparation_update: DataPreparationUpdate
    ) -> Optional[DataPreparation]:
        """Update data preparation step"""
        db_data_preparation = db.query(DataPreparation).filter(
            DataPreparation.id == data_preparation_id
        ).first()
        
        if not db_data_preparation:
            return None
        
        update_data = data_preparation_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_data_preparation, field, value)
        
        db.commit()
        db.refresh(db_data_preparation)
        return db_data_preparation

    # ==================== Model Development ====================
    
    @staticmethod
    def create_model(
        db: Session,
        model: ModelDevelopmentCreate,
        user_id: int
    ) -> ModelDevelopment:
        """Create model development record"""
        db_model = ModelDevelopment(
            **model.dict(),
            created_by=user_id
        )
        db.add(db_model)
        db.commit()
        db.refresh(db_model)
        return db_model

    @staticmethod
    def get_models_by_initiative(
        db: Session,
        initiative_id: int
    ) -> List[ModelDevelopment]:
        """Get all models for an initiative"""
        return db.query(ModelDevelopment).filter(
            ModelDevelopment.initiative_id == initiative_id
        ).all()

    @staticmethod
    def get_model(
        db: Session,
        model_id: int
    ) -> Optional[ModelDevelopment]:
        """Get specific model"""
        return db.query(ModelDevelopment).filter(
            ModelDevelopment.id == model_id
        ).first()

    @staticmethod
    def update_model(
        db: Session,
        model_id: int,
        model_update: ModelDevelopmentUpdate
    ) -> Optional[ModelDevelopment]:
        """Update model"""
        db_model = db.query(ModelDevelopment).filter(
            ModelDevelopment.id == model_id
        ).first()
        
        if not db_model:
            return None
        
        update_data = model_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_model, field, value)
        
        db.commit()
        db.refresh(db_model)
        return db_model

    @staticmethod
    def start_training(
        db: Session,
        model_id: int
    ) -> Optional[ModelDevelopment]:
        """Start model training"""
        db_model = db.query(ModelDevelopment).filter(
            ModelDevelopment.id == model_id
        ).first()
        
        if not db_model:
            return None
        
        db_model.status = ModelStatus.TRAINING
        db_model.training_start = datetime.utcnow()
        
        db.commit()
        db.refresh(db_model)
        return db_model

    @staticmethod
    def complete_training(
        db: Session,
        model_id: int,
        final_metrics: Dict[str, Any]
    ) -> Optional[ModelDevelopment]:
        """Complete model training"""
        db_model = db.query(ModelDevelopment).filter(
            ModelDevelopment.id == model_id
        ).first()
        
        if not db_model:
            return None
        
        db_model.status = ModelStatus.COMPLETED
        db_model.training_end = datetime.utcnow()
        db_model.final_metrics = final_metrics
        
        if db_model.training_start:
            duration = (db_model.training_end - db_model.training_start).total_seconds() / 3600
            db_model.training_duration_hours = duration
        
        db.commit()
        db.refresh(db_model)
        return db_model

    # ==================== Model Evaluation ====================
    
    @staticmethod
    def create_evaluation(
        db: Session,
        evaluation: ModelEvaluationCreate,
        user_id: int
    ) -> ModelEvaluation:
        """Create model evaluation"""
        db_evaluation = ModelEvaluation(
            **evaluation.dict(),
            created_by=user_id
        )
        db.add(db_evaluation)
        db.commit()
        db.refresh(db_evaluation)
        return db_evaluation

    @staticmethod
    def get_evaluations_by_model(
        db: Session,
        model_id: int
    ) -> List[ModelEvaluation]:
        """Get all evaluations for a model"""
        return db.query(ModelEvaluation).filter(
            ModelEvaluation.model_id == model_id
        ).order_by(ModelEvaluation.evaluation_date.desc()).all()

    @staticmethod
    def get_evaluation(
        db: Session,
        evaluation_id: int
    ) -> Optional[ModelEvaluation]:
        """Get specific evaluation"""
        return db.query(ModelEvaluation).filter(
            ModelEvaluation.id == evaluation_id
        ).first()

    @staticmethod
    def update_evaluation(
        db: Session,
        evaluation_id: int,
        evaluation_update: ModelEvaluationUpdate
    ) -> Optional[ModelEvaluation]:
        """Update evaluation"""
        db_evaluation = db.query(ModelEvaluation).filter(
            ModelEvaluation.id == evaluation_id
        ).first()
        
        if not db_evaluation:
            return None
        
        update_data = evaluation_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_evaluation, field, value)
        
        db.commit()
        db.refresh(db_evaluation)
        return db_evaluation

    @staticmethod
    def approve_for_deployment(
        db: Session,
        evaluation_id: int,
        user_id: int
    ) -> Optional[ModelEvaluation]:
        """Approve model for deployment"""
        db_evaluation = db.query(ModelEvaluation).filter(
            ModelEvaluation.id == evaluation_id
        ).first()
        
        if not db_evaluation:
            return None
        
        db_evaluation.approved_for_deployment = True
        db_evaluation.approved_by = user_id
        db_evaluation.approved_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_evaluation)
        return db_evaluation

    # ==================== Model Deployment ====================
    
    @staticmethod
    def create_deployment(
        db: Session,
        deployment: ModelDeploymentCreate,
        user_id: int
    ) -> ModelDeployment:
        """Create model deployment"""
        db_deployment = ModelDeployment(
            **deployment.dict(),
            deployed_by=user_id
        )
        db.add(db_deployment)
        db.commit()
        db.refresh(db_deployment)
        return db_deployment

    @staticmethod
    def get_deployments_by_model(
        db: Session,
        model_id: int
    ) -> List[ModelDeployment]:
        """Get all deployments for a model"""
        return db.query(ModelDeployment).filter(
            ModelDeployment.model_id == model_id
        ).order_by(ModelDeployment.deployment_date.desc()).all()

    @staticmethod
    def get_deployment(
        db: Session,
        deployment_id: int
    ) -> Optional[ModelDeployment]:
        """Get specific deployment"""
        return db.query(ModelDeployment).filter(
            ModelDeployment.id == deployment_id
        ).first()

    @staticmethod
    def update_deployment(
        db: Session,
        deployment_id: int,
        deployment_update: ModelDeploymentUpdate
    ) -> Optional[ModelDeployment]:
        """Update deployment"""
        db_deployment = db.query(ModelDeployment).filter(
            ModelDeployment.id == deployment_id
        ).first()
        
        if not db_deployment:
            return None
        
        update_data = deployment_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_deployment, field, value)
        
        db.commit()
        db.refresh(db_deployment)
        return db_deployment

    @staticmethod
    def deploy_model(
        db: Session,
        deployment_id: int
    ) -> Optional[ModelDeployment]:
        """Execute model deployment"""
        db_deployment = db.query(ModelDeployment).filter(
            ModelDeployment.id == deployment_id
        ).first()
        
        if not db_deployment:
            return None
        
        db_deployment.deployment_status = DeploymentStatus.DEPLOYING
        db_deployment.deployment_date = datetime.utcnow()
        
        db.commit()
        db.refresh(db_deployment)
        return db_deployment

    @staticmethod
    def complete_deployment(
        db: Session,
        deployment_id: int,
        success: bool,
        logs: Optional[str] = None,
        error: Optional[str] = None
    ) -> Optional[ModelDeployment]:
        """Complete deployment"""
        db_deployment = db.query(ModelDeployment).filter(
            ModelDeployment.id == deployment_id
        ).first()
        
        if not db_deployment:
            return None
        
        db_deployment.deployment_status = DeploymentStatus.DEPLOYED if success else DeploymentStatus.FAILED
        db_deployment.deployment_logs = logs
        db_deployment.error_message = error
        
        db.commit()
        db.refresh(db_deployment)
        return db_deployment

    @staticmethod
    def rollback_deployment(
        db: Session,
        deployment_id: int,
        previous_deployment_id: int
    ) -> Optional[ModelDeployment]:
        """Rollback to previous deployment"""
        db_deployment = db.query(ModelDeployment).filter(
            ModelDeployment.id == deployment_id
        ).first()
        
        if not db_deployment:
            return None
        
        db_deployment.deployment_status = DeploymentStatus.RETIRED
        db_deployment.previous_deployment_id = previous_deployment_id
        
        db.commit()
        db.refresh(db_deployment)
        return db_deployment

    # ==================== Model Monitoring ====================
    
    @staticmethod
    def record_monitoring(
        db: Session,
        monitoring: ModelMonitoringCreate
    ) -> ModelMonitoring:
        """Record monitoring data"""
        db_monitoring = ModelMonitoring(**monitoring.dict())
        db.add(db_monitoring)
        db.commit()
        db.refresh(db_monitoring)
        return db_monitoring

    @staticmethod
    def get_monitoring_by_deployment(
        db: Session,
        deployment_id: int,
        limit: int = 100
    ) -> List[ModelMonitoring]:
        """Get monitoring history for a deployment"""
        return db.query(ModelMonitoring).filter(
            ModelMonitoring.deployment_id == deployment_id
        ).order_by(ModelMonitoring.monitoring_date.desc()).limit(limit).all()

    @staticmethod
    def get_latest_monitoring(
        db: Session,
        deployment_id: int
    ) -> Optional[ModelMonitoring]:
        """Get latest monitoring data"""
        return db.query(ModelMonitoring).filter(
            ModelMonitoring.deployment_id == deployment_id
        ).order_by(ModelMonitoring.monitoring_date.desc()).first()

    # ==================== Dashboard & Analytics ====================
    
    @staticmethod
    def get_project_overview(
        db: Session,
        initiative_id: int
    ) -> Optional[ProjectOverviewDashboard]:
        """Get project overview dashboard"""
        from app.models.initiative import Initiative
        
        initiative = db.query(Initiative).filter(Initiative.id == initiative_id).first()
        if not initiative:
            return None
        
        business_understanding = AIProjectService.get_business_understanding_by_initiative(db, initiative_id)
        datasets = AIProjectService.get_data_understanding_by_initiative(db, initiative_id)
        models = AIProjectService.get_models_by_initiative(db, initiative_id)
        
        # Count active deployments
        active_deployments = 0
        for model in models:
            deployments = AIProjectService.get_deployments_by_model(db, model.id)
            active_deployments += sum(1 for d in deployments if d.deployment_status == DeploymentStatus.DEPLOYED)
        
        # Calculate phase completion
        business_complete = business_understanding is not None and business_understanding.go_no_go_decision == GoNoGoDecision.GO
        data_understanding_complete = len(datasets) > 0 and all(d.status == PipelineStatus.COMPLETED for d in datasets)
        
        # Calculate overall progress
        phases_complete = sum([
            business_complete,
            data_understanding_complete,
            False,  # data_preparation
            False,  # modeling
            False,  # evaluation
            False,  # deployment
            active_deployments > 0  # monitoring
        ])
        overall_progress = (phases_complete / 7) * 100
        
        return ProjectOverviewDashboard(
            initiative_id=initiative_id,
            initiative_title=initiative.title,
            current_phase="business_understanding" if not business_complete else "data_understanding",
            overall_progress=overall_progress,
            business_understanding_complete=business_complete,
            data_understanding_complete=data_understanding_complete,
            data_preparation_complete=False,
            modeling_complete=False,
            evaluation_complete=False,
            deployment_complete=active_deployments > 0,
            monitoring_active=active_deployments > 0,
            go_no_go_decision=business_understanding.go_no_go_decision.value if business_understanding else "pending",
            total_datasets=len(datasets),
            total_models=len(models),
            active_deployments=active_deployments,
            health_status="healthy" if active_deployments > 0 else "not_deployed"
        )
