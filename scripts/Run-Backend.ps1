# Runs the FastAPI backend for Rally Forge
Write-Host 'Starting backend server...'
uvicorn backend.main:app --reload

