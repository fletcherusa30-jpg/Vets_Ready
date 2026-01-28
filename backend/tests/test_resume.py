import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_generate_resume():
    response = client.post("/resume/generate", json={"service_history": "Army 2001-2010"})
    assert response.status_code == 200
    data = response.json()
    assert "resume_text" in data
    assert "Army 2001-2010" in data["resume_text"]
