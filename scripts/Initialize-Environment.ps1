# Initializes the development environment for Vets Ready
Write-Host 'Checking for Node, Python, and Git...'
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Write-Host 'Node.js not found!' }
if (-not (Get-Command python -ErrorAction SilentlyContinue)) { Write-Host 'Python not found!' }
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Write-Host 'Git not found!' }
Write-Host 'Environment check complete.'
