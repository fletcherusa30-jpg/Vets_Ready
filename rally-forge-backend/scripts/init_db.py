#!/usr/bin/env python3
"""
Initialize database and create tables
Run this once before starting the backend server
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import init_db, engine, Base
from app.models.user import User
from app.models.claim import Claim
from app.models.condition import Condition
from app.models.subscription import VeteranSubscription, EmployerAccount, JobPost
from app.models.referral import Referral

def main():
    """Initialize database"""
    print("🚀 Initializing Rally Forge Database...")

    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✓ Database tables created successfully!")
        print("\nTables created:")
        print("  - users")
        print("  - claims")
        print("  - conditions")
        print("  - veteran_subscriptions")
        print("  - employer_accounts")
        print("  - job_posts")
        print("  - referrals")
        print("\n✓ Database initialization complete!")
        print("\nNext steps:")
        print("  1. Run: python scripts/seed_data.py (optional - adds sample data)")
        print("  2. Run: uvicorn app.main:app --reload (starts backend server)")

    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

