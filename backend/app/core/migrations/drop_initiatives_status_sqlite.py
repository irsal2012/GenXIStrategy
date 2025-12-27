"""Drop `status` column from `initiatives` table (SQLite).

This project does not use Alembic migrations. For SQLite we implement
explicit migration scripts.

IMPORTANT:
- SQLite cannot `ALTER TABLE ... DROP COLUMN` reliably across versions.
- The standard approach is:
  1) create new table without the column
  2) copy data
  3) drop old table
  4) rename

Usage:
  python3 -m backend.app.core.migrations.drop_initiatives_status_sqlite --db backend/caio_platform.db
"""

from __future__ import annotations

import argparse
from contextlib import closing
import sqlite3


def migrate(db_path: str) -> None:
    with closing(sqlite3.connect(db_path)) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        # Ensure table exists
        row = cur.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='initiatives'"
        ).fetchone()
        if not row:
            raise RuntimeError("initiatives table not found")

        cols = [r[1] for r in cur.execute("PRAGMA table_info(initiatives)").fetchall()]
        if "status" not in cols:
            print("No-op: initiatives.status does not exist")
            return

        # Define new schema (status removed)
        cur.execute("PRAGMA foreign_keys=off")
        cur.execute("BEGIN")

        cur.execute(
            """
            CREATE TABLE initiatives_new (
                id INTEGER NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                business_objective TEXT,
                priority VARCHAR(8) NOT NULL,
                ai_type VARCHAR(12),
                strategic_domain VARCHAR(100),
                business_function VARCHAR(100),
                data_sources JSON,
                budget_allocated FLOAT,
                budget_spent FLOAT,
                expected_roi FLOAT,
                actual_roi FLOAT,
                business_value_score INTEGER,
                technical_feasibility_score INTEGER,
                risk_score INTEGER,
                strategic_alignment_score INTEGER,
                owner_id INTEGER NOT NULL,
                team_members JSON,
                stakeholders JSON,
                technologies JSON,
                tags JSON,
                start_date DATETIME,
                target_completion_date DATETIME,
                actual_completion_date DATETIME,
                created_at DATETIME,
                updated_at DATETIME,
                roadmap_timeline_id INTEGER,
                roadmap_quarter VARCHAR(10),
                roadmap_position VARCHAR(20),
                primary_pattern VARCHAR(50),
                search_text TEXT,
                source VARCHAR(20) NOT NULL DEFAULT 'internal',
                PRIMARY KEY (id),
                FOREIGN KEY(owner_id) REFERENCES users (id),
                FOREIGN KEY(roadmap_timeline_id) REFERENCES roadmap_timelines (id)
            )
            """
        )

        # Copy across all fields except status
        cur.execute(
            """
            INSERT INTO initiatives_new (
                id, title, description, business_objective,
                priority, ai_type, strategic_domain, business_function, data_sources,
                budget_allocated, budget_spent, expected_roi, actual_roi,
                business_value_score, technical_feasibility_score, risk_score, strategic_alignment_score,
                owner_id, team_members, stakeholders, technologies, tags,
                start_date, target_completion_date, actual_completion_date,
                created_at, updated_at,
                roadmap_timeline_id, roadmap_quarter, roadmap_position,
                primary_pattern, search_text, source
            )
            SELECT
                id, title, description, business_objective,
                priority, ai_type, strategic_domain, business_function, data_sources,
                budget_allocated, budget_spent, expected_roi, actual_roi,
                business_value_score, technical_feasibility_score, risk_score, strategic_alignment_score,
                owner_id, team_members, stakeholders, technologies, tags,
                start_date, target_completion_date, actual_completion_date,
                created_at, updated_at,
                roadmap_timeline_id, roadmap_quarter, roadmap_position,
                primary_pattern, search_text, source
            FROM initiatives
            """
        )

        cur.execute("DROP TABLE initiatives")
        cur.execute("ALTER TABLE initiatives_new RENAME TO initiatives")
        cur.execute("CREATE INDEX IF NOT EXISTS ix_initiatives_title ON initiatives (title)")
        cur.execute("CREATE INDEX IF NOT EXISTS ix_initiatives_id ON initiatives (id)")

        cur.execute("COMMIT")
        cur.execute("PRAGMA foreign_keys=on")

        print("OK: dropped initiatives.status")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", required=True, help="Path to sqlite DB file")
    args = parser.parse_args()
    migrate(args.db)


if __name__ == "__main__":
    main()

