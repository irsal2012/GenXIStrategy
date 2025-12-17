"""Script to create a test user for the CAIO Platform."""
import sys
from pathlib import Path

# Add the backend directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.user import User, Base
from app.core.security import get_password_hash

# Create tables
Base.metadata.create_all(bind=engine)


def create_test_user():
    """Create a test admin user."""
    db: Session = SessionLocal()
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == "admin@example.com").first()
        if existing_user:
            print("User admin@example.com already exists!")
            return
        
        # Create new user
        password = "admin123"
        # Ensure password is within bcrypt's 72 byte limit
        if len(password.encode('utf-8')) > 72:
            password = password[:72]
        hashed_password = get_password_hash(password)
        user = User(
            email="admin@example.com",
            full_name="Admin User",
            hashed_password=hashed_password,
            is_active=True,
            is_superuser=True
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print(f"✅ Test user created successfully!")
        print(f"   Email: admin@example.com")
        print(f"   Password: admin123")
        print(f"   User ID: {user.id}")
        
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_test_user()
