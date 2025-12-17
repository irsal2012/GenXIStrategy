from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)  # e.g., "create", "update", "delete"
    entity_type = Column(String(100), nullable=False)  # e.g., "initiative", "risk", "policy"
    entity_id = Column(Integer, nullable=False)
    changes = Column(JSON)  # Store what changed
    ip_address = Column(String(50))
    user_agent = Column(String(255))
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    initiative_id = Column(Integer, ForeignKey("initiatives.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    parent_id = Column(Integer, ForeignKey("comments.id"))  # For threaded comments
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    initiative = relationship("Initiative", back_populates="comments")
    user = relationship("User", back_populates="comments")
    replies = relationship("Comment", backref="parent", remote_side=[id])
