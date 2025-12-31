"""
Manual migration script for PMI-CPMAI fields in BusinessUnderstanding table.
Run this script to add new columns to the business_understanding table.
"""
from sqlalchemy import create_engine, text
from app.core.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def migrate_business_understanding():
    """Add PMI-CPMAI fields to business_understanding table."""
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.begin() as conn:
        # Check if business_understanding table exists
        if settings.DATABASE_URL.startswith("sqlite"):
            table_exists = conn.execute(
                text("SELECT name FROM sqlite_master WHERE type='table' AND name='business_understanding'")
            ).fetchone()
        else:
            # PostgreSQL
            table_exists = conn.execute(
                text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'business_understanding')")
            ).fetchone()
        
        if not table_exists or (isinstance(table_exists, tuple) and not table_exists[0]):
            logger.warning("business_understanding table does not exist yet. It will be created on first run.")
            return
        
        # Get existing columns
        if settings.DATABASE_URL.startswith("sqlite"):
            cols = {
                row[1]
                for row in conn.execute(text("PRAGMA table_info(business_understanding)"))
            }
        else:
            # PostgreSQL
            result = conn.execute(
                text("SELECT column_name FROM information_schema.columns WHERE table_name = 'business_understanding'")
            )
            cols = {row[0] for row in result}
        
        logger.info(f"Existing columns: {cols}")
        
        # Define new columns to add
        new_columns = [
            ("business_problem_text", "TEXT"),
            ("ai_pattern", "VARCHAR(100)"),
            ("ai_pattern_confidence", "FLOAT"),
            ("pattern_override", "BOOLEAN DEFAULT FALSE"),
            ("ai_pattern_reasoning", "TEXT"),
            ("similar_initiatives_found", "JSON"),
            ("ai_recommended_initiative_id", "INTEGER"),
            ("ai_recommendation_reasoning", "TEXT"),
            ("user_feedback_no_match", "TEXT"),
            ("compliance_requirements", "JSON"),
            ("selected_use_case", "JSON"),
            ("ai_feasibility_analysis", "JSON"),
            ("ai_go_no_go_assessment", "JSON"),
        ]
        
        # Add missing columns
        for col_name, col_type in new_columns:
            if col_name not in cols:
                try:
                    logger.info(f"Adding column: {col_name} ({col_type})")
                    conn.execute(text(f"ALTER TABLE business_understanding ADD COLUMN {col_name} {col_type}"))
                    logger.info(f"✓ Added column: {col_name}")
                except Exception as e:
                    logger.error(f"✗ Error adding column {col_name}: {e}")
            else:
                logger.info(f"Column {col_name} already exists, skipping")
        
        logger.info("Migration completed successfully!")


if __name__ == "__main__":
    logger.info("Starting PMI-CPMAI migration...")
    migrate_business_understanding()
    logger.info("Migration finished!")
