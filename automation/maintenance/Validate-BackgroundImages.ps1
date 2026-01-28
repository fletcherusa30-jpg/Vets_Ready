<#!
.SYNOPSIS
    Validates the branch and custom background image folders used by the Background Selector system.

.DESCRIPTION
    Checks that each service branch folder exists under the provided Images root, ensures only supported
    file types are present, and optionally creates missing folders. Also inspects the Custom folder and
    reports file counts plus any issues that need attention.

.PARAMETER ImagesRoot
    Root directory that should contain branch-specific folders (e.g. C:\Dev\Vets Ready\App\Images).

.PARAMETER CreateMissing
    When specified, missing branch/custom folders will be created automatically instead of just warning.

.EXAMPLE
    ./Validate-BackgroundImages.ps1 -CreateMissing
#>

[CmdletBinding()]
param(
    [string]$ImagesRoot = (Join-Path -Path (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)) -ChildPath 'App/Images'),
    [switch]$CreateMissing
)

$ErrorActionPreference = 'Stop'
$allowedExtensions = @('.jpg', '.jpeg', '.png', '.webp')
$branches = @('Army', 'Navy', 'Air Force', 'Marines', 'Coast Guard', 'Space Force')

function Ensure-Folder {
    param(
        [string]$Path
    )

    if (Test-Path -LiteralPath $Path) {
        return (Get-Item -LiteralPath $Path)
    }

    if ($CreateMissing) {
        Write-Verbose "Creating missing folder: $Path"
        return (New-Item -ItemType Directory -Path $Path -Force)
    }

    Write-Warning "Missing folder: $Path"
    return $null
}

Write-Host "\n🔍 Validating background assets in $ImagesRoot" -ForegroundColor Cyan

$rootItem = Ensure-Folder -Path $ImagesRoot
if (-not $rootItem) {
    Write-Error "Images root does not exist and CreateMissing was not specified."
    exit 1
}

$summary = @()
$totalImages = 0

foreach ($branch in $branches) {
    $branchPath = Join-Path -Path $ImagesRoot -ChildPath $branch
    $folder = Ensure-Folder -Path $branchPath

    if (-not $folder) {
        $summary += [pscustomobject]@{ Branch = $branch; Images = 0; Status = 'Missing' }
        continue
    }

    $images = Get-ChildItem -Path $branchPath -File -ErrorAction SilentlyContinue |
        Where-Object { $allowedExtensions -contains $_.Extension.ToLower() }

    $invalid = Get-ChildItem -Path $branchPath -File -ErrorAction SilentlyContinue |
        Where-Object { $allowedExtensions -notcontains $_.Extension.ToLower() }

    if ($invalid.Count -gt 0) {
        Write-Warning "[$branch] contains unsupported file types: $($invalid.Name -join ', ')"
    }

    $totalImages += $images.Count
    $summary += [pscustomobject]@{ Branch = $branch; Images = $images.Count; Status = 'OK' }
}

$customPath = Join-Path -Path $ImagesRoot -ChildPath 'Custom'
$customFolder = Ensure-Folder -Path $customPath
$customImages = @()
if ($customFolder) {
    $customImages = Get-ChildItem -Path $customPath -File -ErrorAction SilentlyContinue |
        Where-Object { $allowedExtensions -contains $_.Extension.ToLower() }
    $totalImages += $customImages.Count
}

Write-Host "\n📋 Branch Inventory" -ForegroundColor Yellow
$summary | Sort-Object Branch | Format-Table -AutoSize

if ($customFolder) {
    Write-Host "\n🧳 Custom Uploads: $($customImages.Count)" -ForegroundColor Yellow
}

Write-Host "\n✅ Validation complete. Total supported images: $totalImages" -ForegroundColor Green
if (-not $CreateMissing) {
    Write-Host "Use -CreateMissing to automatically scaffold branches or the Custom folder." -ForegroundColor DarkGray
}
