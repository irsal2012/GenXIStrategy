from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from pathlib import Path
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.attachment import Attachment, AttachmentType
from app.models.initiative import Initiative
from app.schemas.attachment import (
    Attachment as AttachmentSchema,
    AttachmentCreate,
    AttachmentUpdate,
    AttachmentUploadResponse
)

router = APIRouter()

# Configure upload directory
UPLOAD_DIR = Path("/Users/iimran/Desktop/GenXIStrategy/backend/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {
    'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx',
    'txt', 'md', 'csv', 'json', 'png', 'jpg', 'jpeg', 'gif'
}

# Max file size: 50MB
MAX_FILE_SIZE = 50 * 1024 * 1024


def get_file_extension(filename: str) -> str:
    """Extract file extension from filename."""
    return filename.rsplit('.', 1)[1].lower() if '.' in filename else ''


def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed."""
    return get_file_extension(filename) in ALLOWED_EXTENSIONS


def get_mime_type(filename: str) -> str:
    """Get MIME type based on file extension."""
    ext = get_file_extension(filename)
    mime_types = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'txt': 'text/plain',
        'md': 'text/markdown',
        'csv': 'text/csv',
        'json': 'application/json',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif'
    }
    return mime_types.get(ext, 'application/octet-stream')


@router.post("/upload", response_model=AttachmentUploadResponse)
async def upload_attachment(
    file: UploadFile = File(...),
    initiative_id: int = Form(...),
    attachment_type: AttachmentType = Form(AttachmentType.DOCUMENT),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload a file attachment for an initiative.
    """
    # Verify initiative exists
    initiative = db.query(Initiative).filter(Initiative.id == initiative_id).first()
    if not initiative:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Initiative not found"
        )
    
    # Validate file
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Read file content
    content = await file.read()
    file_size = len(content)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / (1024*1024)}MB"
        )
    
    # Generate unique filename
    file_ext = get_file_extension(file.filename)
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    try:
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Create attachment record
    attachment = Attachment(
        initiative_id=initiative_id,
        filename=unique_filename,
        original_filename=file.filename,
        file_path=str(file_path),
        file_size=file_size,
        mime_type=get_mime_type(file.filename),
        attachment_type=attachment_type,
        description=description,
        uploaded_by=current_user.id
    )
    
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    
    return AttachmentUploadResponse(success=True, attachment=attachment)


@router.post("/link", response_model=AttachmentSchema, status_code=status.HTTP_201_CREATED)
def create_link_attachment(
    attachment_in: AttachmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a link attachment (URL) for an initiative.
    """
    # Verify initiative exists
    initiative = db.query(Initiative).filter(Initiative.id == attachment_in.initiative_id).first()
    if not initiative:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Initiative not found"
        )
    
    if not attachment_in.file_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="file_url is required for link attachments"
        )
    
    attachment = Attachment(
        initiative_id=attachment_in.initiative_id,
        filename=attachment_in.original_filename,
        original_filename=attachment_in.original_filename,
        file_url=attachment_in.file_url,
        attachment_type=AttachmentType.LINK,
        description=attachment_in.description,
        uploaded_by=current_user.id
    )
    
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    
    return attachment


@router.get("/initiative/{initiative_id}", response_model=List[AttachmentSchema])
def get_initiative_attachments(
    initiative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all attachments for an initiative.
    """
    # Verify initiative exists
    initiative = db.query(Initiative).filter(Initiative.id == initiative_id).first()
    if not initiative:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Initiative not found"
        )
    
    attachments = db.query(Attachment).filter(Attachment.initiative_id == initiative_id).all()
    return attachments


@router.get("/{attachment_id}", response_model=AttachmentSchema)
def get_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get attachment details by ID.
    """
    attachment = db.query(Attachment).filter(Attachment.id == attachment_id).first()
    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found"
        )
    
    return attachment


@router.put("/{attachment_id}", response_model=AttachmentSchema)
def update_attachment(
    attachment_id: int,
    attachment_in: AttachmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update attachment metadata.
    """
    attachment = db.query(Attachment).filter(Attachment.id == attachment_id).first()
    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found"
        )
    
    # Update fields
    update_data = attachment_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(attachment, field, value)
    
    db.commit()
    db.refresh(attachment)
    return attachment


@router.delete("/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete an attachment.
    """
    attachment = db.query(Attachment).filter(Attachment.id == attachment_id).first()
    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found"
        )
    
    # Delete physical file if it exists
    if attachment.file_path and os.path.exists(attachment.file_path):
        try:
            os.remove(attachment.file_path)
        except Exception as e:
            # Log error but continue with database deletion
            print(f"Failed to delete file: {str(e)}")
    
    db.delete(attachment)
    db.commit()
    return None
