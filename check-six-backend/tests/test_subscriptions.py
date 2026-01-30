"""
Test suite for subscription API endpoints
Run with: pytest tests/test_subscriptions.py
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestVeteranSubscriptions:
    """Tests for veteran subscription endpoints"""

    def test_get_veteran_pricing(self):
        """Test getting veteran pricing tiers"""
        response = client.get("/api/subscriptions/pricing/veteran")
        assert response.status_code == 200

        pricing = response.json()
        assert len(pricing) == 4  # FREE, PRO, FAMILY, LIFETIME

        # Check FREE tier exists
        free_tier = next((p for p in pricing if p["tier"] == "FREE"), None)
        assert free_tier is not None
        assert free_tier["price_yearly"] == 0

        # Check PRO tier
        pro_tier = next((p for p in pricing if p["tier"] == "PRO"), None)
        assert pro_tier is not None
        assert pro_tier["price_yearly"] == 20

        # Check FAMILY tier
        family_tier = next((p for p in pricing if p["tier"] == "FAMILY"), None)
        assert family_tier is not None
        assert family_tier["price_yearly"] == 35

        # Check LIFETIME tier
        lifetime_tier = next((p for p in pricing if p["tier"] == "LIFETIME"), None)
        assert lifetime_tier is not None
        assert lifetime_tier["price_yearly"] == 200

    def test_create_subscription_unauthorized(self):
        """Test creating subscription without authentication"""
        response = client.post(
            "/api/subscriptions/",
            json={"tier": "PRO"}
        )
        assert response.status_code == 401

    # Additional tests would require authentication setup
    # def test_create_pro_subscription(self):
    #     """Test creating a PRO subscription"""
    #     pass


class TestEmployerEndpoints:
    """Tests for employer job board endpoints"""

    def test_get_employer_pricing(self):
        """Test getting employer pricing tiers"""
        response = client.get("/api/employers/pricing")
        assert response.status_code == 200

        pricing = response.json()
        assert len(pricing) == 4  # BASIC, PREMIUM, RECRUITING, ENTERPRISE

        # Check tiers exist and have correct prices
        basic = next((p for p in pricing if p["tier"] == "BASIC"), None)
        assert basic is not None
        assert basic["price_monthly"] == 299


class TestBusinessDirectory:
    """Tests for business directory endpoints"""

    def test_get_business_pricing(self):
        """Test getting business listing pricing"""
        response = client.get("/api/business-directory/pricing")
        assert response.status_code == 200

        pricing = response.json()
        assert len(pricing) == 4  # BASIC, FEATURED, PREMIUM, ADVERTISING


class TestPayments:
    """Tests for payment endpoints"""

    def test_get_pricing_config(self):
        """Test getting Stripe pricing configuration"""
        response = client.get("/pricing/config")
        assert response.status_code == 200

        config = response.json()
        assert "publishable_key" in config
        assert "veteran_prices" in config
        assert "employer_prices" in config
        assert "business_prices" in config


class TestHealthCheck:
    """Tests for health check endpoint"""

    def test_health_endpoint(self):
        """Test health check returns correct data"""
        response = client.get("/health")
        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "healthy"
        assert data["version"] == "1.0.0"
        assert "services" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
