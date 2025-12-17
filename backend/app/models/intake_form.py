from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Enum, JSON
from datetime import datetime
import enum
from app.core.database import Base


class FieldType(str, enum.Enum):
    TEXT = "text"
    TEXTAREA = "textarea"
    NUMBER = "number"
    DATE = "date"
    SELECT = "select"
    MULTISELECT = "multiselect"
    CHECKBOX = "checkbox"
    RADIO = "radio"
    FILE = "file"


class AIType(str, enum.Enum):
    GENAI = "genai"
    PREDICTIVE = "predictive"
    OPTIMIZATION = "optimization"
    AUTOMATION = "automation"


class IntakeFormTemplate(Base):
    __tablename__ = "intake_form_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    business_unit = Column(String(100))  # Optional: specific to business unit
    ai_type = Column(Enum(AIType))  # Optional: specific to AI type
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    fields_config = Column(JSON)  # Store field configurations
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class IntakeFormField(Base):
    __tablename__ = "intake_form_fields"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, nullable=True)  # Null for global fields
    field_name = Column(String(100), nullable=False)
    field_label = Column(String(255), nullable=False)
    field_type = Column(Enum(FieldType), nullable=False)
    field_options = Column(JSON)  # For select/radio options
    is_required = Column(Boolean, default=False)
    placeholder = Column(String(255))
    help_text = Column(Text)
    validation_rules = Column(JSON)  # Store validation rules
    display_order = Column(Integer, default=0)
    conditional_logic = Column(JSON)  # Show/hide based on other fields
    created_at = Column(DateTime, default=datetime.utcnow)
