# Administrator CEP Installation Script
# Run this with "Run as Administrator" if regular CEP isn't working

Write-Host "🔧 Administrator CEP Installation" -ForegroundColor Red
Write-Host "================================" -ForegroundColor Red

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "❌ This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green

# Stop After Effects
Write-Host "`n🛑 Stopping After Effects..." -ForegroundColor Yellow
Get-Process -Name "AfterFX" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 3

# Install to system-wide location
Write-Host "`n📦 Installing to system location..." -ForegroundColor Yellow
$systemPath = "C:\Program Files\Common Files\Adobe\CEP\extensions\com.letterblack.genai"

# Remove existing
if (Test-Path $systemPath) {
    Remove-Item -Path $systemPath -Recurse -Force
}

# Copy extension
Copy-Item -Path "build\extension\*" -Destination $systemPath -Recurse -Force
Write-Host "  ✅ Copied to: $systemPath" -ForegroundColor Green

# Copy manifest
if (!(Test-Path "$systemPath\CSXS")) {
    New-Item -ItemType Directory -Path "$systemPath\CSXS" -Force | Out-Null
}
Copy-Item -Path "config\CSXS\manifest.xml" -Destination "$systemPath\CSXS\manifest.xml" -Force

# Create debug file
Set-Content -Path "$systemPath\.debug" -Value ""

# Set registry for all users
Write-Host "`n🔧 Setting system-wide registry..." -ForegroundColor Yellow
$cepVersions = @("CSXS.6", "CSXS.7", "CSXS.8", "CSXS.9", "CSXS.10", "CSXS.11", "CSXS.12")
foreach ($version in $cepVersions) {
    # Current user
    $regPath = "HKCU:\SOFTWARE\Adobe\$version"
    if (!(Test-Path $regPath)) {
        New-Item -Path $regPath -Force | Out-Null
    }
    Set-ItemProperty -Path $regPath -Name "PlayerDebugMode" -Value "1"
    Set-ItemProperty -Path $regPath -Name "LogLevel" -Value "6"
    
    # All users
    $regPathAll = "HKLM:\SOFTWARE\Adobe\$version"
    if (!(Test-Path $regPathAll)) {
        New-Item -Path $regPathAll -Force | Out-Null
    }
    Set-ItemProperty -Path $regPathAll -Name "PlayerDebugMode" -Value "1"
    Set-ItemProperty -Path $regPathAll -Name "LogLevel" -Value "6"
    
    Write-Host "  ✅ Configured $version (user & system)" -ForegroundColor Green
}

# Clear all caches
Write-Host "`n🧹 Clearing all CEP caches..." -ForegroundColor Yellow
$cachePaths = @(
    "$env:APPDATA\Adobe\CEP\cache",
    "$env:LOCALAPPDATA\Adobe\CEP",
    "$env:LOCALAPPDATA\Temp\cep_cache",
    "C:\ProgramData\Adobe\CEP\cache"
)

foreach ($path in $cachePaths) {
    if (Test-Path $path) {
        Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  🗑️ Cleared: $path" -ForegroundColor Gray
    }
}

Write-Host "`n🚀 Starting After Effects..." -ForegroundColor Green
$aeExe = Get-ChildItem -Path "${env:ProgramFiles}\Adobe\Adobe After Effects*\Support Files\AfterFX.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($aeExe) {
    Start-Process -FilePath $aeExe.FullName
    Write-Host "  ✅ Started After Effects" -ForegroundColor Green
}

Write-Host "`n🎯 Check Window > Extensions for:" -ForegroundColor Cyan
Write-Host "  • LetterBlack GenAI" -ForegroundColor White
Write-Host ""
Write-Host "================================" -ForegroundColor Red
