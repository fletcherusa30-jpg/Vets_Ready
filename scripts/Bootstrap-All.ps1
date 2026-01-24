# Orchestrates environment check, frontend build, backend run, and AI engine test run
Write-Host 'Bootstrapping all components...'
& ./scripts/Initialize-Environment.ps1
& ./scripts/Build-Frontend.ps1
& ./scripts/Run-Backend.ps1
& ./scripts/Run-AIEngine-Tests.ps1
Write-Host 'Bootstrap complete.'
