"""
Pytest configuration and fixtures for backend tests
"""
import os
import pytest
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

# Import your app
from app.main import app
from app.database import Base, get_db

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Create test database for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db) -> Generator:
    """Create test client with dependency override"""
    def override_get_db():
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_conditions(db):
    """Sample test conditions"""
    from app.models.condition import Condition

    conditions = [
        Condition(
            name="PTSD",
            code="F4310",
            description="Post-Traumatic Stress Disorder",
            disability_rating=30
        ),
        Condition(
            name="TBI",
            code="S06",
            description="Traumatic Brain Injury",
            disability_rating=20
        ),
        Condition(
            name="Tinnitus",
            code="H9311",
            description="Ringing in ears",
            disability_rating=10
        ),
    ]

    for condition in conditions:
        db.add(condition)

    db.commit()
    return conditions


@pytest.fixture
def sample_user(db):
    """Sample test user"""
    from app.models.user import User
    from app.utils.security import hash_password

    user = User(
        email="veteran@example.com",
        full_name="John Doe",
        hashed_password=hash_password("password123"),
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def auth_token(client, sample_user):
    """Get JWT token for authenticated requests"""
    response = client.post(
        "/api/auth/login",
        data={
            "username": "veteran@example.com",
            "password": "password123"
        }
    )
    return response.json()["access_token"]


@pytest.fixture
def auth_headers(auth_token):
    """Get authorization headers with token"""
    return {"Authorization": f"Bearer {auth_token}"}
