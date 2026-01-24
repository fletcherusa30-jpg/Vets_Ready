$ErrorActionPreference = 'Stop'
Set-Location 'C:\Dev\PhoneApp\android'
Write-Host 'Running: gradlew clean assembleDebug' -ForegroundColor Cyan
./gradlew clean assembleDebug
Write-Host 'Debug build complete. APK should be under app/build/outputs/apk/debug/' -ForegroundColor Green






