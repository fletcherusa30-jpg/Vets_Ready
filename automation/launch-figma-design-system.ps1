# rallyforge Figma Design System Auto-Launch Script
# This script opens Figma, creates a new file, and names it "rallyforge Design System"
# You can run this in PowerShell on Windows

$figmaPath = "C:\Users\$env:USERNAME\AppData\Local\Figma\Figma.exe"
$designSystemName = "rallyforge Design System"

if (-not (Test-Path $figmaPath)) {
    Write-Host "Figma is not installed at $figmaPath. Please install Figma Desktop first." -ForegroundColor Red
    exit 1
}

Start-Process -FilePath $figmaPath
Start-Sleep -Seconds 5

Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.SendKeys]::SendWait("^n") # Ctrl+N for new file
Start-Sleep -Seconds 2
[System.Windows.Forms.SendKeys]::SendWait("{F2}") # Rename file
Start-Sleep -Seconds 1
[System.Windows.Forms.SendKeys]::SendWait("$designSystemName{ENTER}")

Write-Host "Figma launched and new design system file created: $designSystemName" -ForegroundColor Green

