#!/usr/bin/env python3
"""
Standalone script to seed analytics test data.
Run this from the backend directory: python seed_analytics.py
"""

import sys
from pathlib import Path

# Add the backend directory to the path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal
from app.core.seed_analytics_data import seed_analytics_data

if __name__ == "__main__":
    print("Starting analytics data seeding...")
    db = SessionLocal()
    try:
        seed_analytics_data(db)
        print("\n✅ Analytics data seeding completed successfully!")
    except Exception as e:
        print(f"\n❌ Error during seeding: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()
