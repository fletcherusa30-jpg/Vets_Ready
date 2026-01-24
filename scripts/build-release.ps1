$ErrorActionPreference = 'Stop'
Set-Location 'C:\Dev\PhoneApp\android'
Write-Host 'Running: gradlew clean assembleRelease' -ForegroundColor Cyan
./gradlew clean assembleRelease
Write-Host 'Release build complete. APK should be under app/build/outputs/apk/release/' -ForegroundColor Green






