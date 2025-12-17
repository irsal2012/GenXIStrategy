from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.attachment import AttachmentType


class AttachmentBase(BaseModel):
    filename: str
    original_filename: str
    file_path: Optional[str] = None
    file_url: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    attachment_type: AttachmentType = AttachmentType.DOCUMENT
    description: Optional[str] = None


class AttachmentCreate(BaseModel):
    initiative_id: int
    original_filename: str
    attachment_type: AttachmentType = AttachmentType.DOCUMENT
    description: Optional[str] = None
    file_url: Optional[str] = None  # For link attachments


class AttachmentUpdate(BaseModel):
    description: Optional[str] = None
    attachment_type: Optional[AttachmentType] = None


class Attachment(AttachmentBase):
    id: int
    initiative_id: int
    uploaded_by: int
    created_at: datetime

    class Config:
        from_attributes = True


class AttachmentUploadResponse(BaseModel):
    success: bool
    attachment: Optional[Attachment] = None
    error: Optional[str] = None
