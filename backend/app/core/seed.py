"""Database seed utilities.

This module is intentionally small and side-effect free. It is called from
`app.main` during startup.

Goal: ensure a predictable development experience by creating a default admin
account when running locally.

IMPORTANT:
- In production, do NOT ship default credentials.
- We only *reset* the password in development environments.
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User, UserRole

DEFAULT_ADMIN_EMAIL = "admin@example.com"
DEFAULT_ADMIN_PASSWORD = "admin123"
DEFAULT_ADMIN_NAME = "Admin User"


def seed_default_admin(db: Session) -> None:
    """Create (and in development, normalize) the default admin user.

    Behavior:
    - If admin@example.com doesn't exist: create it with password admin123.
    - If it exists:
        - Ensure it's active and superuser.
        - If ENVIRONMENT == development: reset password to admin123.

    This makes the login credentials stable across fresh DBs, especially when
    using docker-compose (MySQL) where the sqlite `caio_platform.db` is not used.
    """

    user = db.query(User).filter(User.email == DEFAULT_ADMIN_EMAIL).first()

    desired_hash = get_password_hash(DEFAULT_ADMIN_PASSWORD)

    if user is None:
        user = User(
            email=DEFAULT_ADMIN_EMAIL,
            full_name=DEFAULT_ADMIN_NAME,
            role=UserRole.CAIO,
            hashed_password=desired_hash,
            is_active=True,
            is_superuser=True,
        )
        db.add(user)
        db.commit()
        return

    # Ensure flags are correct
    changed = False
    if not user.is_active:
        user.is_active = True
        changed = True
    if not user.is_superuser:
        user.is_superuser = True
        changed = True

    # In dev only, normalize password to default
    if settings.ENVIRONMENT == "development":
        user.hashed_password = desired_hash
        changed = True

    if changed:
        db.add(user)
        db.commit()
