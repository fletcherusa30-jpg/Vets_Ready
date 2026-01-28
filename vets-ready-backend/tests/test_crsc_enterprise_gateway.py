from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.schemas.crsc_enterprise import CrscAnalyticsEvent

client = TestClient(app)

# Ensure we have at least one key/token for tests
if not settings.enterprise_api_keys:
    settings.enterprise_api_keys.append("test-key")

headers = {
    "X-API-Key": settings.enterprise_api_keys[0],
    "X-Org-Role": "ORG_ADMIN",
}

def test_ingest_and_fetch_events():
    event = {
        "cohortId": "cohort-1",
        "timestamp": "2024-01-01T00:00:00Z",
        "eligibilityStatus": "Likely",
        "combatRelatedPercentage": 70,
        "evidenceStrength": "HIGH",
        "crscPayableEstimate": 500.0,
        "retirementImpactScore": 0.2,
        "combatCategoryCounts": {
            "armedConflict": 1,
            "hazardousService": 0,
            "simulatedWar": 0,
            "instrumentalityOfWar": 0,
            "purpleHeart": 0,
        },
    }

    resp = client.post("/enterprise/crsc/events", json=event, headers=headers)
    assert resp.status_code == 202

    resp = client.get("/enterprise/crsc/analytics/summary", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["eligibilityDistribution"].get("Likely", 0) >= 1


def test_trends_endpoint():
    resp = client.get("/enterprise/crsc/analytics/trends", headers=headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
