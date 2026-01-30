"""
Integration tests for API endpoints
"""
import pytest
from fastapi.testclient import TestClient


@pytest.mark.integration
class TestAuthAPI:
    """Tests for authentication endpoints"""

    def test_login_success(self, client, sample_user):
        """Test successful login"""
        response = client.post(
            "/api/auth/login",
            data={
                "username": "veteran@example.com",
                "password": "password123"
            }
        )

        assert response.status_code == 200
        assert "access_token" in response.json()
        assert response.json()["token_type"] == "bearer"

    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials"""
        response = client.post(
            "/api/auth/login",
            data={
                "username": "invalid@example.com",
                "password": "wrongpassword"
            }
        )

        assert response.status_code == 401

    def test_get_current_user(self, client, auth_headers, sample_user):
        """Test retrieving current user"""
        response = client.get(
            "/api/auth/me",
            headers=auth_headers
        )

        assert response.status_code == 200
        assert response.json()["email"] == "veteran@example.com"


@pytest.mark.integration
class TestConditionsAPI:
    """Tests for conditions endpoints"""

    def test_list_conditions(self, client, sample_conditions):
        """Test listing conditions"""
        response = client.get("/api/conditions")

        assert response.status_code == 200
        conditions = response.json()
        assert len(conditions) == 3
        assert any(c["name"] == "PTSD" for c in conditions)

    def test_get_condition(self, client, sample_conditions):
        """Test getting single condition"""
        response = client.get("/api/conditions/F4310")

        assert response.status_code == 200
        assert response.json()["name"] == "PTSD"

    def test_create_condition_authenticated(self, client, auth_headers):
        """Test creating condition (requires auth)"""
        response = client.post(
            "/api/conditions",
            headers=auth_headers,
            json={
                "name": "Sleep Apnea",
                "code": "G4733",
                "description": "Sleep disorder",
                "disability_rating": 30
            }
        )

        assert response.status_code == 201
        assert response.json()["name"] == "Sleep Apnea"

    def test_create_condition_unauthorized(self, client):
        """Test creating condition without authentication"""
        response = client.post(
            "/api/conditions",
            json={
                "name": "Sleep Apnea",
                "code": "G4733",
                "description": "Sleep disorder",
                "disability_rating": 30
            }
        )

        assert response.status_code == 401


@pytest.mark.integration
class TestClaimsAPI:
    """Tests for claims analysis endpoints"""

    def test_analyze_claims_success(self, client, auth_headers, sample_conditions):
        """Test successful claims analysis"""
        response = client.post(
            "/api/claims/analyze",
            headers=auth_headers,
            json={
                "conditions": ["F4310", "S06"],
                "medical_evidence": {
                    "diagnoses": ["PTSD", "TBI"],
                    "treatments": ["VA hospital", "therapy"],
                    "medications": ["sertraline", "prazosin"]
                }
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "recommendations" in data
        assert "combined_rating" in data

    def test_analyze_claims_invalid_conditions(self, client, auth_headers):
        """Test analysis with invalid condition codes"""
        response = client.post(
            "/api/claims/analyze",
            headers=auth_headers,
            json={
                "conditions": ["INVALID"],
                "medical_evidence": {}
            }
        )

        # Should either return 404 or handle gracefully
        assert response.status_code in [400, 404]

    def test_analyze_claims_unauthorized(self, client):
        """Test analysis without authentication"""
        response = client.post(
            "/api/claims/analyze",
            json={
                "conditions": ["F4310"],
                "medical_evidence": {}
            }
        )

        assert response.status_code == 401
