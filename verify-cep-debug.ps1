# CEP Debug Verification Script
# Comprehensive check for CEP debugging setup

Write-Host "🔍 CEP Debug Mode Verification" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check Registry Settings
Write-Host "`n📋 Registry Settings:" -ForegroundColor Yellow
$cepVersions = @("CSXS.9", "CSXS.10", "CSXS.11", "CSXS.12")
foreach ($version in $cepVersions) {
    $regPath = "HKCU:\SOFTWARE\Adobe\$version"
    if (Test-Path $regPath) {
        $debugMode = Get-ItemProperty -Path $regPath -Name "PlayerDebugMode" -ErrorAction SilentlyContinue
        $logLevel = Get-ItemProperty -Path $regPath -Name "LogLevel" -ErrorAction SilentlyContinue
        
        if ($debugMode) {
            Write-Host "  ✅ $version - PlayerDebugMode: $($debugMode.PlayerDebugMode)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $version - PlayerDebugMode: Not Set" -ForegroundColor Red
        }
        
        if ($logLevel) {
            Write-Host "     LogLevel: $($logLevel.LogLevel)" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ❌ $version - Path not found" -ForegroundColor Red
    }
}

# Check Extension Installation
Write-Host "`n📦 Extension Installation:" -ForegroundColor Yellow
$extensionPath = "$env:APPDATA\Adobe\CEP\extensions\com.letterblack.genai"
if (Test-Path $extensionPath) {
    Write-Host "  ✅ Extension installed at: $extensionPath" -ForegroundColor Green
    
    # Check key files
    $keyFiles = @("index.html", "CSXS\manifest.xml", "host\main.jsx")
    foreach ($file in $keyFiles) {
        $filePath = Join-Path $extensionPath $file
        if (Test-Path $filePath) {
            Write-Host "  ✅ $file - Found" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $file - Missing" -ForegroundColor Red
        }
    }
} else {
    Write-Host "  ❌ Extension not installed" -ForegroundColor Red
}

# Check manifest for debug settings
Write-Host "`n🔧 Manifest Debug Configuration:" -ForegroundColor Yellow
$manifestPath = Join-Path $extensionPath "CSXS\manifest.xml"
if (Test-Path $manifestPath) {
    $manifestContent = Get-Content $manifestPath -Raw
    
    if ($manifestContent -like "*--remote-debugging-port=8000*") {
        Write-Host "  ✅ Remote debugging port configured" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Remote debugging port not configured" -ForegroundColor Red
    }
    
    if ($manifestContent -like "*<DebugPort>8000</DebugPort>*") {
        Write-Host "  ✅ Debug port specified in manifest" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Debug port not specified in manifest" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ Manifest file not found" -ForegroundColor Red
}

# Check After Effects processes
Write-Host "`n🎬 After Effects Status:" -ForegroundColor Yellow
$aeProcess = Get-Process -Name "AfterFX" -ErrorAction SilentlyContinue
if ($aeProcess) {
    Write-Host "  ✅ After Effects is running (PID: $($aeProcess.Id))" -ForegroundColor Green
    Write-Host "  ⚠️  You may need to restart After Effects to see debug changes" -ForegroundColor Yellow
} else {
    Write-Host "  ❌ After Effects is not running" -ForegroundColor Red
}

# Instructions
Write-Host "`n🎯 Debug Instructions:" -ForegroundColor Cyan
Write-Host "1. 🚀 Start After Effects (if not running)" -ForegroundColor White
Write-Host "2. 📱 Go to Window > Extensions > LetterBlack_Gen_AI" -ForegroundColor White
Write-Host "3. 🔍 Look for GREEN BORDER around the extension panel" -ForegroundColor Green
Write-Host "4. 🖱️  Right-click in extension panel > Select 'Debug'" -ForegroundColor White
Write-Host "5. 🌐 Chrome DevTools should open at http://localhost:8000" -ForegroundColor White

Write-Host "`n🔍 Troubleshooting:" -ForegroundColor Cyan
Write-Host "• If no green border: Restart After Effects" -ForegroundColor Gray
Write-Host "• If extension doesn't appear: Check Window > Extensions menu" -ForegroundColor Gray
Write-Host "• If 'Debug' option missing: Verify registry settings above" -ForegroundColor Gray
Write-Host "• If Chrome doesn't open: Check Windows Firewall/Antivirus" -ForegroundColor Gray

Write-Host "`n=================================" -ForegroundColor Cyan
Write-Host "📋 Debug setup verification complete!" -ForegroundColor Green
