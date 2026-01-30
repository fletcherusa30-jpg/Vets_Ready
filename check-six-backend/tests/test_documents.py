"""
Tests for Document Upload MVP endpoint
"""

import pytest
import json
import os
import sys
from pathlib import Path
from io import BytesIO

# Add the backend directory to the path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import just what we need for basic testing
from fastapi.testclient import TestClient


def test_documents_router_import():
    """Test that the documents router can be imported"""
    from app.routers import documents
    assert documents.router is not None
    assert documents.router.prefix == "/api/documents"


def test_sanitize_log_data():
    """Test that sensitive fields are properly sanitized"""
    from app.routers.documents import sanitize_log_data
    
    test_data = {
        "ssn": "123-45-6789",
        "branch": "Army",
        "full_name": "John Doe",
        "rank": "Sergeant"
    }
    
    sanitized = sanitize_log_data(test_data)
    
    assert sanitized["ssn"] == "[REDACTED]"
    assert sanitized["full_name"] == "[REDACTED]"
    assert sanitized["branch"] == "Army"
    assert sanitized["rank"] == "Sergeant"


def test_sanitize_nested_data():
    """Test sanitization of nested data structures"""
    from app.routers.documents import sanitize_log_data
    
    test_data = {
        "user_info": {
            "name": "John",
            "ssn": "123-45-6789",
            "branch": "Navy"
        },
        "rank": "Captain"
    }
    
    sanitized = sanitize_log_data(test_data)
    
    assert sanitized["user_info"]["ssn"] == "[REDACTED]"
    assert sanitized["user_info"]["branch"] == "Navy"
    assert sanitized["rank"] == "Captain"


# Only run integration tests if all dependencies are available
try:
    from app.main import app
    
    client = TestClient(app)


    @pytest.fixture
    def sample_pdf_file():
        """Create a sample PDF file for testing"""
        # Simple PDF content (minimal valid PDF)
        pdf_content = b"""%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test DD-214) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
410
%%EOF"""
        return BytesIO(pdf_content)


    @pytest.fixture
    def sample_parsed_fields():
        """Sample parsed fields from client-side OCR"""
        return {
            "branch": "Army",
            "entryDate": "2010-01-15",
            "separationDate": "2018-05-30",
            "rank": "Sergeant",
            "characterOfService": "Honorable"
        }


    def test_upload_document_success(sample_pdf_file, sample_parsed_fields):
        """Test successful document upload"""
        response = client.post(
            "/api/documents/upload",
            files={"file": ("test-dd214.pdf", sample_pdf_file, "application/pdf")},
            data={
                "document_type": "dd214",
                "parsed_fields": json.dumps(sample_parsed_fields),
                "consent": "true"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "document_id" in data
        assert data["message"] == "Document uploaded successfully"


    def test_upload_document_no_consent(sample_pdf_file, sample_parsed_fields):
        """Test upload fails without consent"""
        response = client.post(
            "/api/documents/upload",
            files={"file": ("test-dd214.pdf", sample_pdf_file, "application/pdf")},
            data={
                "document_type": "dd214",
                "parsed_fields": json.dumps(sample_parsed_fields),
                "consent": "false"
            }
        )
        
        assert response.status_code == 400
        assert "consent" in response.json()["detail"].lower()


    def test_upload_document_invalid_type(sample_pdf_file, sample_parsed_fields):
        """Test upload fails with invalid document type"""
        response = client.post(
            "/api/documents/upload",
            files={"file": ("test-dd214.pdf", sample_pdf_file, "application/pdf")},
            data={
                "document_type": "invalid_type",
                "parsed_fields": json.dumps(sample_parsed_fields),
                "consent": "true"
            }
        )
        
        assert response.status_code == 400
        assert "dd-214" in response.json()["detail"].lower()


    def test_upload_document_invalid_json(sample_pdf_file):
        """Test upload fails with invalid JSON in parsed_fields"""
        response = client.post(
            "/api/documents/upload",
            files={"file": ("test-dd214.pdf", sample_pdf_file, "application/pdf")},
            data={
                "document_type": "dd214",
                "parsed_fields": "not valid json",
                "consent": "true"
            }
        )
        
        assert response.status_code == 400
        assert "json" in response.json()["detail"].lower()


    def test_upload_document_unsupported_file_type(sample_parsed_fields):
        """Test upload fails with unsupported file type"""
        txt_file = BytesIO(b"This is a text file")
        
        response = client.post(
            "/api/documents/upload",
            files={"file": ("test.txt", txt_file, "text/plain")},
            data={
                "document_type": "dd214",
                "parsed_fields": json.dumps(sample_parsed_fields),
                "consent": "true"
            }
        )
        
        assert response.status_code == 400
        assert "unsupported" in response.json()["detail"].lower()


    def test_health_check():
        """Test health check endpoint"""
        response = client.get("/api/documents/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "document-upload-mvp"
        assert "timestamp" in data

except ImportError as e:
    print(f"Skipping integration tests due to missing dependencies: {e}")

