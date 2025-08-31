# CEP Extension Diagnostic Script
# This script performs comprehensive checks to diagnose extension visibility issues

Write-Host "🔍 CEP Extension Diagnostic Analysis" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# 1. Check if After Effects is running
Write-Host "`n1. 🎬 After Effects Status:" -ForegroundColor Yellow
$aeProcess = Get-Process -Name "AfterFX" -ErrorAction SilentlyContinue
if ($aeProcess) {
    Write-Host "  ✅ After Effects is running (PID: $($aeProcess.Id))" -ForegroundColor Green
    
    # Get AE version from process
    $aeVersion = $aeProcess.MainModule.FileVersionInfo.FileVersion
    Write-Host "  📊 Version: $aeVersion" -ForegroundColor White
} else {
    Write-Host "  ❌ After Effects is not running" -ForegroundColor Red
    Write-Host "  🚀 Starting After Effects..." -ForegroundColor Yellow
    
    # Find and start AE
    $aeExe = Get-ChildItem -Path "${env:ProgramFiles}\Adobe\Adobe After Effects*\Support Files\AfterFX.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($aeExe) {
        Start-Process -FilePath $aeExe.FullName
        Write-Host "  ✅ Started After Effects" -ForegroundColor Green
    }
}

# 2. Registry Debug Settings Check
Write-Host "`n2. 🔧 Registry Debug Settings:" -ForegroundColor Yellow
$cepVersions = @("CSXS.6", "CSXS.7", "CSXS.8", "CSXS.9", "CSXS.10", "CSXS.11", "CSXS.12")
foreach ($version in $cepVersions) {
    $regPath = "HKCU:\SOFTWARE\Adobe\$version"
    if (Test-Path $regPath) {
        $debugMode = (Get-ItemProperty -Path $regPath -Name "PlayerDebugMode" -ErrorAction SilentlyContinue).PlayerDebugMode
        $logLevel = (Get-ItemProperty -Path $regPath -Name "LogLevel" -ErrorAction SilentlyContinue).LogLevel
        
        if ($debugMode -eq "1") {
            Write-Host "  ✅ $version - Debug: $debugMode, Log: $logLevel" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $version - Debug mode not enabled" -ForegroundColor Red
        }
    }
}

# 3. Extension Installation Check
Write-Host "`n3. 📦 Extension Installation:" -ForegroundColor Yellow
$extensionPaths = @(
    "$env:APPDATA\Adobe\CEP\extensions\com.letterblack.genai",
    "$env:ProgramFiles\Common Files\Adobe\CEP\extensions\com.letterblack.genai",
    "$env:ProgramFiles(x86)\Common Files\Adobe\CEP\extensions\com.letterblack.genai"
)

foreach ($path in $extensionPaths) {
    if (Test-Path $path) {
        Write-Host "  ✅ Found extension at: $path" -ForegroundColor Green
        
        # Check critical files
        $criticalFiles = @("index.html", "CSXS\manifest.xml")
        foreach ($file in $criticalFiles) {
            $fullPath = Join-Path $path $file
            if (Test-Path $fullPath) {
                Write-Host "    ✅ $file exists" -ForegroundColor Green
            } else {
                Write-Host "    ❌ $file MISSING" -ForegroundColor Red
            }
        }
        
        # Check .debug file
        $debugFile = Join-Path $path ".debug"
        if (Test-Path $debugFile) {
            Write-Host "    ✅ .debug file exists" -ForegroundColor Green
        } else {
            Write-Host "    ❌ .debug file missing" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚫ Not found: $path" -ForegroundColor Gray
    }
}

# 4. Manifest Validation
Write-Host "`n4. 📄 Manifest Validation:" -ForegroundColor Yellow
$manifestPath = "$env:APPDATA\Adobe\CEP\extensions\com.letterblack.genai\CSXS\manifest.xml"
if (Test-Path $manifestPath) {
    try {
        [xml]$manifest = Get-Content $manifestPath
        Write-Host "  ✅ Manifest XML is valid" -ForegroundColor Green
        
        # Extract key info
        $bundleId = $manifest.ExtensionManifest.ExtensionBundleId
        $version = $manifest.ExtensionManifest.Version
        $hostName = $manifest.ExtensionManifest.ExecutionEnvironment.HostList.Host.Name
        $hostVersion = $manifest.ExtensionManifest.ExecutionEnvironment.HostList.Host.Version
        $menuName = $manifest.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.UI.Menu
        
        Write-Host "    📋 Bundle ID: $bundleId" -ForegroundColor White
        Write-Host "    📋 CSXS Version: $version" -ForegroundColor White
        Write-Host "    📋 Host: $hostName ($hostVersion)" -ForegroundColor White
        Write-Host "    📋 Menu Name: $menuName" -ForegroundColor White
        
    } catch {
        Write-Host "  ❌ Manifest XML is invalid: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ Manifest not found at: $manifestPath" -ForegroundColor Red
}

# 5. CEP Cache Check
Write-Host "`n5. 🗂️ CEP Cache Status:" -ForegroundColor Yellow
$cachePaths = @(
    "$env:APPDATA\Adobe\CEP\extensions",
    "$env:LOCALAPPDATA\Adobe\CEP",
    "$env:TEMP\cep_cache"
)

foreach ($path in $cachePaths) {
    if (Test-Path $path) {
        $items = Get-ChildItem $path -ErrorAction SilentlyContinue | Measure-Object
        Write-Host "  📁 $path ($($items.Count) items)" -ForegroundColor White
    } else {
        Write-Host "  ⚫ Not found: $path" -ForegroundColor Gray
    }
}

# 6. Port Check
Write-Host "`n6. 🌐 Debug Port Check:" -ForegroundColor Yellow
try {
    $connection = Test-NetConnection -ComputerName "localhost" -Port 8000 -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "  ✅ Port 8000 is accessible" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ Port 8000 is not accessible (extension may not be loaded)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠️ Cannot test port 8000" -ForegroundColor Yellow
}

# 7. Environment Variables
Write-Host "`n7. 🌍 Environment Variables:" -ForegroundColor Yellow
$envVars = @("CEP_DEBUG_MODE", "ENABLE_NODE_JS_DEBUGGING")
foreach ($var in $envVars) {
    $value = [Environment]::GetEnvironmentVariable($var)
    if ($value) {
        Write-Host "  ✅ $var = $value" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ $var not set" -ForegroundColor Yellow
    }
}

# 8. Generate Troubleshooting Report
Write-Host "`n8. 🔧 Troubleshooting Recommendations:" -ForegroundColor Yellow

if (!(Get-Process -Name "AfterFX" -ErrorAction SilentlyContinue)) {
    Write-Host "  🔸 Start After Effects and wait for full load" -ForegroundColor White
}

Write-Host "  🔸 Try these steps in order:" -ForegroundColor White
Write-Host "     1. Window > Extensions (look for LetterBlack GenAI)" -ForegroundColor Gray
Write-Host "     2. Window > Extensions > Browse for Extensions" -ForegroundColor Gray
Write-Host "     3. Restart After Effects completely" -ForegroundColor Gray
Write-Host "     4. Run PowerShell/VS Code as Administrator" -ForegroundColor Gray
Write-Host "     5. Clear CEP cache and reinstall" -ForegroundColor Gray

Write-Host "`n9. 🚀 Quick Fix Actions:" -ForegroundColor Yellow
Write-Host "Would you like me to:" -ForegroundColor White
Write-Host "  [1] Clear CEP cache and reinstall extension" -ForegroundColor Gray
Write-Host "  [2] Create a minimal test extension" -ForegroundColor Gray
Write-Host "  [3] Check After Effects extensions folder directly" -ForegroundColor Gray
Write-Host "  [4] Generate debug log" -ForegroundColor Gray

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "🎯 Diagnostic complete!" -ForegroundColor Green
