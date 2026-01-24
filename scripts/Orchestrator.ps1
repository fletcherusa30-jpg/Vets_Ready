$Root = "C:\Dev\PhoneApp"
$Scripts = "$Root\scripts"
. "$Scripts\Run-Diagnostics.ps1"
. "$Scripts\Repair-Environment.ps1"
. "$Scripts\AutoHeal.ps1"
. "$Scripts\Launch-App.ps1"
Invoke-FullDiagnostic -Root $Root
Invoke-FullRepair -Root $Root
Invoke-AutoHeal -Root $Root
Invoke-AppLaunch -Root $Root
Write-Host "=== ORCHESTRATOR COMPLETE ==="





