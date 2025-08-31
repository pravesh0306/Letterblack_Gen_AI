# After Effects CEP Extension Debugging Script
# LetterBlack GenAI Extension Debug Helper

param(
    [switch]$Build,
    [switch]$Install,
    [switch]$Debug,
    [switch]$Clean,
    [switch]$All
)

Write-Host "🔧 LetterBlack GenAI Debug Helper" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

$extensionName = "com.letterblack.genai"
$buildPath = ".\build\extension"
$extensionPath = "$env:APPDATA\Adobe\CEP\extensions\$extensionName"

function Enable-CEPDebug {
    Write-Host "🔓 Enabling CEP Debug Mode..." -ForegroundColor Yellow
    
    # Enable debug mode for CSXS 12.0 (After Effects 2023+)
    $regPath = "HKCU:\SOFTWARE\Adobe\CSXS.12"
    if (!(Test-Path $regPath)) {
        New-Item -Path $regPath -Force | Out-Null
    }
    Set-ItemProperty -Path $regPath -Name "PlayerDebugMode" -Value "1"
    
    Write-Host "✅ CEP Debug Mode enabled" -ForegroundColor Green
}

function Build-Extension {
    Write-Host "🏗️ Building Extension..." -ForegroundColor Yellow
    
    # Clean build directory
    if (Test-Path $buildPath) {
        Remove-Item -Path $buildPath -Recurse -Force
    }
    New-Item -ItemType Directory -Path $buildPath -Force | Out-Null
    
    # Copy source files
    Copy-Item -Path "src\*" -Destination $buildPath -Recurse -Force
    Copy-Item -Path "config\*" -Destination $buildPath -Recurse -Force
    
    # Create host directory and copy host files
    New-Item -ItemType Directory -Path "$buildPath\host" -Force | Out-Null
    Copy-Item -Path "host\*" -Destination "$buildPath\host\" -Recurse -Force
    
    Write-Host "✅ Extension built successfully" -ForegroundColor Green
}

function Install-Extension {
    Write-Host "📦 Installing Extension..." -ForegroundColor Yellow
    
    # Remove existing installation
    if (Test-Path $extensionPath) {
        Remove-Item -Path $extensionPath -Recurse -Force
        Write-Host "🗑️ Removed existing installation" -ForegroundColor Gray
    }
    
    # Create extension directory
    New-Item -ItemType Directory -Path $extensionPath -Force | Out-Null
    
    # Copy built extension
    Copy-Item -Path "$buildPath\*" -Destination $extensionPath -Recurse -Force
    
    Write-Host "✅ Extension installed to: $extensionPath" -ForegroundColor Green
}

function Start-DebugMode {
    Write-Host "🐛 Starting Debug Mode..." -ForegroundColor Yellow
    
    # Check if After Effects is running
    $aeProcess = Get-Process -Name "AfterFX" -ErrorAction SilentlyContinue
    if ($aeProcess) {
        Write-Host "⚠️ After Effects is running. You may need to restart it to see changes." -ForegroundColor Yellow
    }
    
    Write-Host "🌐 Extension installed. Debug info:" -ForegroundColor Cyan
    Write-Host "   Extension ID: $extensionName" -ForegroundColor Gray
    Write-Host "   Path: $extensionPath" -ForegroundColor Gray
    Write-Host "   Debug URL: http://localhost:8000" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "🔍 Debug Instructions:" -ForegroundColor Cyan
    Write-Host "1. Open After Effects" -ForegroundColor White
    Write-Host "2. Go to Window > Extensions > LetterBlack_Gen_AI" -ForegroundColor White
    Write-Host "3. Right-click in the panel and select 'Debug'" -ForegroundColor White
    Write-Host "4. Chrome DevTools will open for debugging" -ForegroundColor White
    
    Write-Host ""
    Write-Host "📝 Common Debug Locations:" -ForegroundColor Cyan
    Write-Host "   Console: Check for JavaScript errors" -ForegroundColor White
    Write-Host "   Network: Monitor API calls" -ForegroundColor White
    Write-Host "   Elements: Inspect HTML/CSS" -ForegroundColor White
}

function Clean-Extension {
    Write-Host "🧹 Cleaning Extension..." -ForegroundColor Yellow
    
    if (Test-Path $buildPath) {
        Remove-Item -Path $buildPath -Recurse -Force
        Write-Host "🗑️ Removed build directory" -ForegroundColor Gray
    }
    
    if (Test-Path $extensionPath) {
        Remove-Item -Path $extensionPath -Recurse -Force
        Write-Host "🗑️ Removed installed extension" -ForegroundColor Gray
    }
    
    Write-Host "✅ Cleanup complete" -ForegroundColor Green
}

# Execute based on parameters
if ($All -or $Clean) {
    Clean-Extension
}

if ($All -or $Build) {
    Enable-CEPDebug
    Build-Extension
}

if ($All -or $Install) {
    Install-Extension
}

if ($All -or $Debug) {
    Start-DebugMode
}

# Default action if no parameters
if (-not ($Build -or $Install -or $Debug -or $Clean -or $All)) {
    Write-Host "📋 Usage:" -ForegroundColor Cyan
    Write-Host "  .\debug-ae-extension.ps1 -All       # Complete build, install, and debug setup" -ForegroundColor White
    Write-Host "  .\debug-ae-extension.ps1 -Build     # Build extension only" -ForegroundColor White
    Write-Host "  .\debug-ae-extension.ps1 -Install   # Install to AE only" -ForegroundColor White
    Write-Host "  .\debug-ae-extension.ps1 -Debug     # Show debug instructions" -ForegroundColor White
    Write-Host "  .\debug-ae-extension.ps1 -Clean     # Clean build and installation" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Quick start: .\debug-ae-extension.ps1 -All" -ForegroundColor Green
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
