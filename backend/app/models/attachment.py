from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class AttachmentType(str, enum.Enum):
    DOCUMENT = "document"
    SLIDE = "slide"
    LINK = "link"
    IMAGE = "image"
    OTHER = "other"


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    initiative_id = Column(Integer, ForeignKey("initiatives.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500))  # For stored files
    file_url = Column(String(500))  # For links
    file_size = Column(Integer)  # Size in bytes
    mime_type = Column(String(100))
    attachment_type = Column(Enum(AttachmentType), nullable=False, default=AttachmentType.DOCUMENT)
    description = Column(Text)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    initiative = relationship("Initiative", back_populates="attachments")
    uploader = relationship("User", foreign_keys=[uploaded_by])
