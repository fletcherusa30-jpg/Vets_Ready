$Root = "C:\Dev\PhoneApp"
$BackupRoot = Join-Path $Root ("bom_backups_" + (Get-Date -Format "yyyyMMdd_HHmmss"))
New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null
$BOMs = @(
    [byte[]](0xEF,0xBB,0xBF),
    [byte[]](0xFF,0xFE),
    [byte[]](0xFE,0xFF),
    [byte[]](0xFF,0xFE,0x00,0x00),
    [byte[]](0x00,0x00,0xFE,0xFF)
)
$Files = Get-ChildItem -Path $Root -Recurse -File
$FixedCount = 0
foreach ($file in $Files) {
    try {
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
        foreach ($bom in $BOMs) {
            if ($bytes.Length -ge $bom.Length -and ($bytes[0..($bom.Length-1)] -join ",") -eq ($bom -join ",")) {
                $relative = $file.FullName.Substring($Root.Length).TrimStart("\")
                $backupPath = Join-Path $BackupRoot $relative
                New-Item -ItemType Directory -Path (Split-Path $backupPath -Parent) -Force | Out-Null
                Copy-Item $file.FullName $backupPath -Force
                $cleanBytes = $bytes[$bom.Length..($bytes.Length-1)]
                [System.IO.File]::WriteAllBytes($file.FullName, $cleanBytes)
                Write-Host "BOM fixed: $($file.FullName)"
                $FixedCount++
                break
            }
        }
    } catch {}
}
Write-Host "BOM scrub complete. Files fixed: $FixedCount"





