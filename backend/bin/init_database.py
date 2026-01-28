#!/usr/bin/env python
"""
Database Initialization & Seed Script
Initializes database schema and populates with seed data
"""

import json
import sys
import logging
from pathlib import Path
from datetime import datetime, timedelta
from enum import Enum

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.app.core.database import (
    engine, SessionLocal, init_db, seed_database, health_check
)
from backend.app.core.repositories import get_repositories
from backend.app.models.database import (
    Veteran, ServiceRecord, TrainingRecord, Certificate, Resume,
    JobListing, Employer, Organization, Condition,
    ServiceBranch, DischargeStatus
)
from sqlalchemy.orm import Session


class DatabaseManager:
    """Handles database initialization, migration, and seeding"""

    def __init__(self):
        self.session = None
        self.repos = None

    def connect(self):
        """Establish database connection"""
        logger.info("Connecting to database...")
        self.session = SessionLocal()
        self.repos = get_repositories(self.session)
        logger.info("✓ Database connection established")

    def disconnect(self):
        """Close database connection"""
        if self.session:
            self.session.close()
            logger.info("✓ Database connection closed")

    def create_schema(self):
        """Create all database tables"""
        logger.info("\nCreating database schema...")
        try:
            init_db()
            logger.info("✓ Schema created successfully")
            return True
        except Exception as e:
            logger.error(f"✗ Schema creation failed: {str(e)}")
            return False

    def load_seed_data_from_files(self):
        """Load seed data from JSON files"""
        logger.info("\nLoading seed data from files...")

        seed_dir = Path(__file__).parent.parent.parent / "data"
        files = {
            "veterans": seed_dir / "seed_veterans.json",
            "jobs": seed_dir / "seed_jobs.json",
            "employers": seed_dir / "seed_employers.json",
        }

        loaded = 0

        for data_type, filepath in files.items():
            if filepath.exists():
                try:
                    with open(filepath, 'r') as f:
                        data = json.load(f)
                    logger.info(f"  • {filepath.name}: {len(data) if isinstance(data, list) else 1} items")
                    loaded += 1
                except Exception as e:
                    logger.warning(f"  • {filepath.name}: Error reading - {str(e)}")

        logger.info(f"✓ Loaded {loaded}/{len(files)} seed data files")

    def populate_seed_data(self):
        """Populate database with seed data"""
        logger.info("\nPopulating seed data...")

        try:
            seed_database()
            logger.info("✓ Seed data loaded successfully")
            return True
        except Exception as e:
            logger.error(f"✗ Seed data loading failed: {str(e)}")
            return False

    def verify_schema(self):
        """Verify database schema was created"""
        logger.info("\nVerifying schema...")

        try:
            # Try to query each model to verify tables exist
            test_queries = [
                (Veteran, "veterans"),
                (ServiceRecord, "service_records"),
                (TrainingRecord, "training_records"),
                (Certificate, "certificates"),
                (Resume, "resumes"),
                (JobListing, "job_listings"),
                (Employer, "employers"),
                (Organization, "organizations"),
                (Condition, "conditions"),
            ]

            for model, table_name in test_queries:
                count = self.session.query(model).count()
                status = "✓" if count >= 0 else "✗"
                logger.info(f"  {status} {table_name}: {count} records")

            logger.info("✓ Schema verification complete")
            return True
        except Exception as e:
            logger.error(f"✗ Schema verification failed: {str(e)}")
            return False

    def check_database_health(self):
        """Check database health"""
        logger.info("\nChecking database health...")

        try:
            health = health_check()
            logger.info(f"  • Status: {health['status']}")
            logger.info(f"  • Response Time: {health['response_time']}ms")
            logger.info(f"  • Connection Pool: {health.get('pool_size', 'N/A')}")
            logger.info("✓ Database health check passed")
            return True
        except Exception as e:
            logger.error(f"✗ Health check failed: {str(e)}")
            return False

    def generate_summary(self):
        """Generate database statistics summary"""
        logger.info("\n" + "="*60)
        logger.info("DATABASE INITIALIZATION SUMMARY")
        logger.info("="*60)

        try:
            stats = {
                "Veterans": self.session.query(Veteran).count(),
                "Service Records": self.session.query(ServiceRecord).count(),
                "Training Records": self.session.query(TrainingRecord).count(),
                "Certificates": self.session.query(Certificate).count(),
                "Resumes": self.session.query(Resume).count(),
                "Job Listings": self.session.query(JobListing).count(),
                "Employers": self.session.query(Employer).count(),
                "Organizations": self.session.query(Organization).count(),
                "Conditions": self.session.query(Condition).count(),
            }

            for entity, count in stats.items():
                logger.info(f"  {entity:.<40} {count:>5} records")

            logger.info("="*60)

        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")

    def initialize_full(self):
        """Run complete initialization sequence"""
        logger.info("\n" + "="*60)
        logger.info("VETSREADY DATABASE INITIALIZATION")
        logger.info("="*60)
        logger.info(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        try:
            # Step 1: Connect
            self.connect()

            # Step 2: Create schema
            if not self.create_schema():
                raise Exception("Schema creation failed")

            # Step 3: Verify schema
            if not self.verify_schema():
                raise Exception("Schema verification failed")

            # Step 4: Load seed files
            self.load_seed_data_from_files()

            # Step 5: Populate seed data
            if not self.populate_seed_data():
                raise Exception("Seed data loading failed")

            # Step 6: Health check
            if not self.check_database_health():
                logger.warning("Health check failed but continuing...")

            # Step 7: Summary
            self.generate_summary()

            logger.info("="*60)
            logger.info("✓ DATABASE INITIALIZATION COMPLETED SUCCESSFULLY")
            logger.info("="*60)

            return True

        except Exception as e:
            logger.error(f"\n✗ INITIALIZATION FAILED: {str(e)}")
            logger.error("="*60)
            return False

        finally:
            self.disconnect()


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(
        description="VetsReady Database Management Tool"
    )
    parser.add_argument(
        "command",
        nargs="?",
        default="init",
        choices=["init", "reset", "verify", "health"],
        help="Command to execute (default: init)"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force reset (delete existing data)"
    )

    args = parser.parse_args()
    manager = DatabaseManager()

    try:
        if args.command == "init":
            success = manager.initialize_full()

        elif args.command == "reset":
            if args.force:
                logger.info("Resetting database...")
                from sqlalchemy import text
                manager.connect()

                # Drop all tables
                logger.info("Dropping all tables...")
                # This is SQLite/SQLAlchemy specific
                from backend.app.models.database import Base
                Base.metadata.drop_all(engine)

                logger.info("✓ Tables dropped")
                success = manager.initialize_full()
            else:
                logger.error("Use --force to confirm database reset")
                success = False

        elif args.command == "verify":
            manager.connect()
            success = manager.verify_schema()
            manager.disconnect()

        elif args.command == "health":
            manager.connect()
            success = manager.check_database_health()
            manager.disconnect()

        return 0 if success else 1

    except Exception as e:
        logger.error(f"Fatal error: {str(e)}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
