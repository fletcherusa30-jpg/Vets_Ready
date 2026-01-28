# Runs the FastAPI backend for Vets Ready
Write-Host 'Starting backend server...'
uvicorn backend.main:app --reload
