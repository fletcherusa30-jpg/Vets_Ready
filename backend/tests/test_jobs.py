import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_job_matches():
    response = client.get("/jobs/matches")
    assert response.status_code == 200
    data = response.json()
    assert "matches" in data
    assert isinstance(data["matches"], list)
