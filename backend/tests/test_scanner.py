import pytest
from fastapi.testclient import TestClient
from app.main import app
import io

client = TestClient(app)

def test_scan_dd214():
    file_content = b"dummy dd214 content"
    response = client.post("/scanner/dd214", files={"file": ("test.dd214", io.BytesIO(file_content), "application/octet-stream")})
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "test.dd214"
    assert data["size"] == len(file_content)
    assert "parsed" in data
