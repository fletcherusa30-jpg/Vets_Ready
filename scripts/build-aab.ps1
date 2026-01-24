$ErrorActionPreference = 'Stop'
Set-Location 'C:\Dev\PhoneApp\android'
Write-Host 'Running: gradlew clean bundleRelease' -ForegroundColor Cyan
./gradlew clean bundleRelease
Write-Host 'AAB build complete. AAB should be under app/build/outputs/bundle/release/' -ForegroundColor Green






