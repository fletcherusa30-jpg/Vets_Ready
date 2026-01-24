"""Seed database with initial data"""

import sys
from sqlalchemy.orm import Session

from app.database import SessionLocal, init_db
from app.models.condition import Condition


def seed_conditions():
    """Load seed conditions"""
    db = SessionLocal()

    # Check if already seeded
    if db.query(Condition).count() > 0:
        print("✓ Conditions already seeded")
        return

    conditions_data = [
        {
            "code": "F4310",
            "name": "PTSD",
            "description": "Post-Traumatic Stress Disorder",
            "disability_rating_default": 50,
        },
        {
            "code": "F3229",
            "name": "Depression",
            "description": "Major Depressive Disorder",
            "disability_rating_default": 30,
        },
        {
            "code": "S06",
            "name": "TBI",
            "description": "Traumatic Brain Injury",
            "disability_rating_default": 40,
        },
        {
            "code": "H9311",
            "name": "Tinnitus",
            "description": "Service-Connected Tinnitus",
            "disability_rating_default": 10,
        },
        {
            "code": "G89.29",
            "name": "Chronic Pain",
            "description": "Chronic Back and Joint Pain",
            "disability_rating_default": 20,
        },
        {
            "code": "L1090",
            "name": "Amputation",
            "description": "Upper Extremity Amputation",
            "disability_rating_default": 60,
        },
        {
            "code": "N0740",
            "name": "Diabetes",
            "description": "Service-Connected Diabetes Mellitus",
            "disability_rating_default": 20,
        },
        {
            "code": "J0380",
            "name": "Asthma",
            "description": "Service-Connected Asthma",
            "disability_rating_default": 30,
        },
    ]

    for cond_data in conditions_data:
        condition = Condition(**cond_data)
        db.add(condition)

    db.commit()
    print(f"✓ Seeded {len(conditions_data)} conditions")
    db.close()


if __name__ == "__main__":
    print("Initializing database...")
    init_db()

    print("Seeding conditions...")
    seed_conditions()

    print("✓ Database setup complete!")
