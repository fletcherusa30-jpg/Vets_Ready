"""
Alembic Configuration Script
Auto-generates migrations for database schema changes
"""

import os
from alembic import config, command
from sqlalchemy import engine_from_config
import logging

logger = logging.getLogger(__name__)

# Alembic configuration
alembic_cfg = config.Config("alembic.ini")


def init_alembic():
    """Initialize Alembic for migrations"""
    try:
        # Create alembic directory structure if it doesn't exist
        if not os.path.exists("alembic"):
            logger.info("Initializing Alembic...")
            command.init(alembic_cfg, "alembic")
            logger.info("Alembic initialized")
    except Exception as e:
        logger.error(f"Error initializing Alembic: {e}")
        raise


def create_migration(message: str):
    """Create a new migration"""
    try:
        logger.info(f"Creating migration: {message}")
        command.revision(alembic_cfg, autogenerate=True, message=message)
        logger.info("Migration created")
    except Exception as e:
        logger.error(f"Error creating migration: {e}")
        raise


def upgrade_db(revision: str = "head"):
    """Run migrations up to specified revision"""
    try:
        logger.info(f"Upgrading database to {revision}...")
        command.upgrade(alembic_cfg, revision)
        logger.info("Database upgraded successfully")
    except Exception as e:
        logger.error(f"Error upgrading database: {e}")
        raise


def downgrade_db(revision: str):
    """Rollback database to specified revision"""
    try:
        logger.info(f"Downgrading database to {revision}...")
        command.downgrade(alembic_cfg, revision)
        logger.info("Database downgraded successfully")
    except Exception as e:
        logger.error(f"Error downgrading database: {e}")
        raise


def current_revision() -> str:
    """Get current database revision"""
    try:
        from sqlalchemy import text
        from backend.app.core.database import SessionLocal

        db = SessionLocal()
        result = db.execute(
            text("SELECT version_num FROM alembic_version ORDER BY version_num DESC LIMIT 1")
        )
        row = result.first()
        db.close()

        if row:
            return row[0]
        return "No migration applied"
    except Exception as e:
        logger.warning(f"Could not get current revision: {e}")
        return "Unknown"


# CLI Commands
if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == "init":
            init_alembic()
        elif command == "migrate":
            message = sys.argv[2] if len(sys.argv) > 2 else "Auto migration"
            create_migration(message)
        elif command == "upgrade":
            revision = sys.argv[2] if len(sys.argv) > 2 else "head"
            upgrade_db(revision)
        elif command == "downgrade":
            revision = sys.argv[2] if len(sys.argv) > 2 else "-1"
            downgrade_db(revision)
        elif command == "current":
            print(f"Current revision: {current_revision()}")
        else:
            print("Unknown command")
    else:
        print("Usage: python migrations.py {init|migrate|upgrade|downgrade|current}")
