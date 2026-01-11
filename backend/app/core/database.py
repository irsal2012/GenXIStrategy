from sqlalchemy import create_engine
from sqlalchemy import event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=settings.ENVIRONMENT == "development"
)

# SQLite does NOT enforce foreign key constraints by default.
# Enabling this makes ON DELETE CASCADE work and keeps relational integrity.
if settings.DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

# Ensure schema is up to date for local development when using SQLite.
# This is a lightweight fallback in lieu of migrations.
# It adds missing columns without dropping data.
if settings.DATABASE_URL.startswith("sqlite"):
    from sqlalchemy import text

    with engine.begin() as conn:
        # Check if initiatives table exists first
        table_exists = conn.execute(
            text("SELECT name FROM sqlite_master WHERE type='table' AND name='initiatives'")
        ).fetchone()
        
        if table_exists:
            cols = {
                row[1]
                for row in conn.execute(text("PRAGMA table_info(initiatives)"))
            }

            def _add_col(name: str, ddl_type: str) -> None:
                if name not in cols:
                    conn.execute(text(f"ALTER TABLE initiatives ADD COLUMN {name} {ddl_type}"))

            # Keep in sync with Initiative model (backend/app/models/initiative.py)
            _add_col("ai_type", "VARCHAR(20)")
            _add_col("strategic_domain", "VARCHAR(100)")
            _add_col("business_function", "VARCHAR(100)")
            _add_col("data_sources", "JSON")
            _add_col("stakeholders", "JSON")

        # Keep governance tables lightly in sync as well (used by delete cascade).
        workflow_approvals_exists = conn.execute(
            text("SELECT name FROM sqlite_master WHERE type='table' AND name='workflow_approvals'")
        ).fetchone()
        if workflow_approvals_exists:
            wa_cols = {
                row[1]
                for row in conn.execute(text("PRAGMA table_info(workflow_approvals)"))
            }
            if "approver_role" not in wa_cols:
                conn.execute(text("ALTER TABLE workflow_approvals ADD COLUMN approver_role VARCHAR(100)"))

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()


# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
