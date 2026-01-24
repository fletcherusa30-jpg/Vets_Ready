# Runs the FastAPI backend for VeteranApp
Write-Host 'Starting backend server...'
uvicorn backend.main:app --reload
