"""
Integration tests for disability calculator FastAPI endpoint
"""

import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.app.main import app

client = TestClient(app)


class TestDisabilityCalculatorEndpoint:
    """Integration tests for /api/disability/combined-rating endpoint"""

    def test_endpoint_exists(self):
        """Endpoint should be accessible"""
        response = client.post(
            "/api/disability/combined-rating",
            json={
                "conditions": [
                    {
                        "condition_name": "Tinnitus",
                        "percentage": 10,
                        "side": "NONE"
                    }
                ],
                "apply_bilateral_factor": True
            }
        )
        assert response.status_code == 200

    def test_single_condition(self):
        """Test single condition calculation"""
        response = client.post(
            "/api/disability/combined-rating",
            json={
                "conditions": [
                    {
                        "condition_name": "Tinnitus",
                        "percentage": 10,
                        "side": "NONE"
                    }
                ]
            }
        )
        data = response.json()

        assert data["true_combined_rating"] == 10.0
        assert data["rounded_combined_rating"] == 10
        assert data["bilateral_applied"] == False

    def test_multiple_conditions(self):
        """Test multiple conditions calculation"""
        response = client.post(
            "/api/disability/combined-rating",
            json={
                "conditions": [
                    {
                        "condition_name": "PTSD",
                        "percentage": 50,
                        "side": "NONE"
                    },
                    {
                        "condition_name": "Tinnitus",
                        "percentage": 10,
                        "side": "NONE"
                    },
                    {
                        "condition_name": "Headaches",
                        "percentage": 20,
                        "side": "NONE"
                    }
                ]
            }
        )
        data = response.json()

        assert response.status_code == 200
        assert "true_combined_rating" in data
        assert "rounded_combined_rating" in data
        assert data["rounded_combined_rating"] > 50

    def test_bilateral_factor_arms(self):
        """Test bilateral factor with arm conditions"""
        response = client.post(
            "/api/disability/combined-rating",
            json={
                "conditions": [
                    {
                        "condition_name": "Left Arm",
                        "percentage": 30,
                        "side": "LEFT",
                        "extremity_group": "ARM"
                    },
                    {
                        "condition_name": "Right Arm",
                        "percentage": 30,
                        "side": "RIGHT",
                        "extremity_group": "ARM"
                    }
                ],
                "apply_bilateral_factor": True
            }
        )
        data = response.json()

        assert response.status_code == 200
        assert data["bilateral_applied"] == True
        assert any("bilateral" in note.lower() for note in data["notes"])

    def test_bilateral_factor_legs(self):
        """Test bilateral factor with leg conditions"""
        response = client.post(
            "/api/disability/combined-rating",
            json={
                "conditions": [
                    {
                        "condition_name": "Left Knee",
                        "percentage": 40,
                        "side": "LEFT",
                        "extremity_group": "LEG"
                    },
                    {
                        "condition_name": "Right Knee",
                        "percentage": 40,
                        "side": "RIGHT",
                        "extremity_group": "LEG"
                    }
                ],
                "apply_bilateral_factor": True
            }
        )
        data = response.json()

        assert response.status_code == 200
        assert data["bilateral_applied"] == True
        # 40% + (40% of 60%) = 64%
        # + 10% bilateral = 70.4%
        assert 65 <= data["rounded_combined_rating"] <= 80

    def test_bilateral_disabled(self):
        """Test that bilateral factor can be disabled"""
        response = client.post(
            "/api/disability/combined-rating",
            json={
                "conditions": [
                    {
                        "condition_name": "Left Knee",
                        "percentage": 30,
                        "side": "LEFT",
                        "extremity_group": "LEG"
                    },
                    {
                        "condition_name": "Right Knee",
                        "percentage": 30,
                        "side": "RIGHT",
                        "extremity_group": "LEG"
                    }
                ],
                "apply_bilateral_factor": False
            }
        )
        data = response.json()

        assert response.status_code == 200
        assert data["bilateral_applied"] == False

    def test_empty_conditions(self):
        """Empty conditions should be valid"""
        response = client.post(
            "/api/disability/combined-rating",
            json={
                "conditions": []
            }
        )
        data = response.json()

        assert response.status_code == 200
        assert data["true_combined_rating"] == 0.0
        assert data["rounded_combined_rating"] == 0

    def test_invalid_percentage_high(self):
        """Percentage > 100 should return 400"""
        response = client.post(
            "/api/disability/combined-rating",
            json={
                "conditions": [
                    {
                        "condition_name": "Invalid",
                        "percentage": 150,
                        "side": "NONE"
                    }
                ]
            }
        )
        assert response.status_code == 400

    def test_invalid_percentage_negative(self):
        """Negative percentage should return 400"""
        response = client.post(
            "/api/disability/combined-rating",
            json={
                "conditions": [
                    {
                        "condition_name": "Invalid",
                        "percentage": -10,
                        "side": "NONE"
                    }
                ]
            }
        )
        assert response.status_code == 400

    def test_empty_condition_name(self):
        """Empty condition name should return 400"""
        response = client.post(
            "/api/disability/combined-rating",
            json={
                "conditions": [
                    {
                        "condition_name": "",
                        "percentage": 10,
                        "side": "NONE"
                    }
                ]
            }
        )
        assert response.status_code == 400

    def test_response_has_steps(self):
        """Response should include calculation steps"""
        response = client.post(
            "/api/disability/combined-rating",
            json={
                "conditions": [
                    {
                        "condition_name": "Condition A",
                        "percentage": 50,
                        "side": "NONE"
                    },
                    {
                        "condition_name": "Condition B",
                        "percentage": 30,
                        "side": "NONE"
                    }
                ]
            }
        )
        data = response.json()

        assert "steps" in data
        assert len(data["steps"]) > 0
        assert "Condition A" in data["steps"][0]

    def test_response_schema(self):
        """Response should match expected schema"""
        response = client.post(
            "/api/disability/combined-rating",
            json={
                "conditions": [
                    {
                        "condition_name": "Test",
                        "percentage": 20,
                        "side": "NONE"
                    }
                ]
            }
        )
        data = response.json()

        assert "true_combined_rating" in data
        assert "rounded_combined_rating" in data
        assert "bilateral_applied" in data
        assert "steps" in data
        assert "notes" in data

        # Check types
        assert isinstance(data["true_combined_rating"], float)
        assert isinstance(data["rounded_combined_rating"], int)
        assert isinstance(data["bilateral_applied"], bool)
        assert isinstance(data["steps"], list)
        assert isinstance(data["notes"], list)

    def test_complex_scenario(self):
        """Test complex scenario with multiple conditions and bilateral factor"""
        response = client.post(
            "/api/disability/combined-rating",
            json={
                "conditions": [
                    {
                        "condition_name": "Left Leg - Below Knee",
                        "percentage": 50,
                        "side": "LEFT",
                        "extremity_group": "LEG"
                    },
                    {
                        "condition_name": "Right Knee",
                        "percentage": 40,
                        "side": "RIGHT",
                        "extremity_group": "LEG"
                    },
                    {
                        "condition_name": "PTSD",
                        "percentage": 50,
                        "side": "NONE"
                    },
                    {
                        "condition_name": "Tinnitus",
                        "percentage": 10,
                        "side": "NONE"
                    },
                    {
                        "condition_name": "Headaches",
                        "percentage": 20,
                        "side": "NONE"
                    }
                ],
                "apply_bilateral_factor": True
            }
        )
        data = response.json()

        assert response.status_code == 200
        assert data["bilateral_applied"] == True
        assert data["rounded_combined_rating"] >= 70
        assert len(data["steps"]) > 0


class TestDisabilityCalculatorHelpEndpoint:
    """Integration tests for /api/disability/help endpoint"""

    def test_help_endpoint_exists(self):
        """Help endpoint should be accessible"""
        response = client.get("/api/disability/help")
        assert response.status_code == 200

    def test_help_contains_documentation(self):
        """Help should contain useful documentation"""
        response = client.get("/api/disability/help")
        data = response.json()

        assert "title" in data
        assert "description" in data
        assert "endpoint" in data
        assert "key_points" in data
