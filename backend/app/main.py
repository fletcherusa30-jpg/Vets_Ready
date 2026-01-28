"""
VetsReady FastAPI Backend

API Spec:
- POST /auth/login: Authenticate user, returns token and user info
- POST /scanner/dd214: Upload and scan DD214 document
- POST /resume/generate: Generate resume from service history
- GET /jobs/matches: Get job matches
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import status
from typing import Optional
import uvicorn

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/auth/login")
def login(data: dict):
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
    return {"token": "dummy-token", "user": {"email": email}}

@app.post("/scanner/dd214")
def scan_dd214(file: UploadFile = File(...)):
    content = file.file.read()
    return {
        "filename": file.filename,
        "size": len(content),
        "parsed": {
            "name": "John Doe",
            "branch": "Army",
            "service_dates": "2001-2010"
        }
    }

@app.post("/resume/generate")
def generate_resume(data: dict):
    service_history = data.get("service_history", "")
    resume_text = f"Veteran Resume\nService History: {service_history}\nSkills: Leadership, Teamwork, Problem Solving"
    return {"resume_text": resume_text}

@app.get("/jobs/matches")
def get_job_matches():
    return {
        "matches": [
            {"title": "Project Manager", "company": "Acme Corp", "score": 92},
            {"title": "Logistics Analyst", "company": "LogiPro", "score": 88},
            {"title": "Operations Lead", "company": "OpsWorks", "score": 85}
        ]
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
