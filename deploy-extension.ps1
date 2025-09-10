# Adobe Extension Deployment & Testing Script
# Deploy and test the Letterblack Gen AI extension in Adobe After Effects

param(
    [switch]$Install,
    [switch]$Test,
    [switch]$Uninstall,
    [switch]$All,
    [string]$AEVersion = "2024"
)

# Configuration
$ExtensionName = "letterblack-gen-ai"
$ZXPFile = "letterblack-gen-ai-v2025.09.08.zxp"
$ExtensionID = "com.letterblack.genai"

# Paths
$ZXPPath = Join-Path $PSScriptRoot $ZXPFile
$CEPExtensionsPath = "$env:APPDATA\Adobe\CEP\extensions"
$ExtensionPath = Join-Path $CEPExtensionsPath $ExtensionID

Write-Host "🚀 Adobe After Effects Extension Deployment Tool" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Extension: Letterblack Gen AI v2025.09.08" -ForegroundColor Green
Write-Host "Package: $ZXPFile" -ForegroundColor Green
Write-Host ""

function Enable-CEPDeveloperMode {
    Write-Host "⚙️ Enabling CEP Developer Mode..." -ForegroundColor Yellow
    
    try {
        # Enable CEP debug mode for different AE versions
        $regPaths = @(
            "HKCU:\Software\Adobe\CSXS.9",   # AE 2019
            "HKCU:\Software\Adobe\CSXS.10",  # AE 2020-2021
            "HKCU:\Software\Adobe\CSXS.11",  # AE 2022+
            "HKCU:\Software\Adobe\CSXS.12"   # Future versions
        )
        
        foreach ($regPath in $regPaths) {
            if (!(Test-Path $regPath)) {
                New-Item -Path $regPath -Force | Out-Null
            }
            Set-ItemProperty -Path $regPath -Name "PlayerDebugMode" -Value "1" -Type String
            Write-Host "✅ Enabled debug mode for $regPath" -ForegroundColor Green
        }
        
        Write-Host "✅ CEP Developer Mode enabled" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Failed to enable CEP Developer Mode: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Install-Extension {
    Write-Host "📦 Installing Adobe Extension..." -ForegroundColor Yellow
    
    # Check if ZXP file exists
    if (!(Test-Path $ZXPPath)) {
        Write-Host "❌ ZXP file not found: $ZXPPath" -ForegroundColor Red
        return $false
    }
    
    # Enable developer mode first
    Enable-CEPDeveloperMode
    
    # Check for ZXP Installer
    $zxpInstaller = Get-Command "ZXPInstaller" -ErrorAction SilentlyContinue
    
    if ($zxpInstaller) {
        Write-Host "🔧 Using ZXP Installer..." -ForegroundColor Cyan
        try {
            & ZXPInstaller -install $ZXPPath
            Write-Host "✅ Extension installed via ZXP Installer" -ForegroundColor Green
            return $true
        }
        catch {
            Write-Host "⚠️ ZXP Installer failed, trying manual installation..." -ForegroundColor Yellow
        }
    }
    
    # Manual installation
    Write-Host "🔧 Manual installation to CEP extensions folder..." -ForegroundColor Cyan
    
    try {
        # Create CEP extensions directory if it doesn't exist
        if (!(Test-Path $CEPExtensionsPath)) {
            New-Item -Path $CEPExtensionsPath -ItemType Directory -Force | Out-Null
        }
        
        # Remove existing installation
        if (Test-Path $ExtensionPath) {
            Remove-Item -Path $ExtensionPath -Recurse -Force
            Write-Host "🗑️ Removed existing installation" -ForegroundColor Yellow
        }
        
        # Extract ZXP (it's just a ZIP file)
        Expand-Archive -Path $ZXPPath -DestinationPath $ExtensionPath -Force
        
        Write-Host "✅ Extension manually installed to: $ExtensionPath" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Manual installation failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-Extension {
    Write-Host "🧪 Testing Extension Installation..." -ForegroundColor Yellow
    
    $testResults = @{
        "Extension Folder Exists" = Test-Path $ExtensionPath
        "Manifest File Exists" = Test-Path (Join-Path $ExtensionPath "CSXS\manifest.xml")
        "Main HTML Exists" = Test-Path (Join-Path $ExtensionPath "index.html")
        "JavaScript Files Exist" = Test-Path (Join-Path $ExtensionPath "js\main.js")
        "CSS Files Exist" = Test-Path (Join-Path $ExtensionPath "css\main-styles.css")
    }
    
    $allPassed = $true
    foreach ($test in $testResults.GetEnumerator()) {
        if ($test.Value) {
            Write-Host "✅ $($test.Key)" -ForegroundColor Green
        } else {
            Write-Host "❌ $($test.Key)" -ForegroundColor Red
            $allPassed = $false
        }
    }
    
    if ($allPassed) {
        Write-Host "🎉 All installation tests passed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Next Steps:" -ForegroundColor Cyan
        Write-Host "1. Open Adobe After Effects" -ForegroundColor White
        Write-Host "2. Go to Window > Extensions > Letterblack Gen AI" -ForegroundColor White
        Write-Host "3. Configure your API keys in the settings" -ForegroundColor White
        Write-Host "4. Test basic functionality" -ForegroundColor White
        
        # Launch After Effects if available
        $aeExe = Get-ChildItem "C:\Program Files\Adobe\Adobe After Effects*\Support Files\AfterFX.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($aeExe) {
            Write-Host ""
            $launchAE = Read-Host "🚀 Launch Adobe After Effects now? (y/n)"
            if ($launchAE -eq 'y' -or $launchAE -eq 'Y') {
                Start-Process $aeExe.FullName
                Write-Host "🎬 Adobe After Effects launched!" -ForegroundColor Green
            }
        }
        
        return $true
    } else {
        Write-Host "❌ Some installation tests failed" -ForegroundColor Red
        return $false
    }
}

function Uninstall-Extension {
    Write-Host "🗑️ Uninstalling Extension..." -ForegroundColor Yellow
    
    try {
        if (Test-Path $ExtensionPath) {
            Remove-Item -Path $ExtensionPath -Recurse -Force
            Write-Host "✅ Extension uninstalled from: $ExtensionPath" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️ Extension not found at: $ExtensionPath" -ForegroundColor Yellow
            return $true
        }
    }
    catch {
        Write-Host "❌ Failed to uninstall extension: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Show-ExtensionInfo {
    Write-Host "📊 Extension Information:" -ForegroundColor Cyan
    Write-Host "========================" -ForegroundColor Cyan
    
    if (Test-Path $ZXPPath) {
        $zxpSize = (Get-Item $ZXPPath).Length / 1MB
        Write-Host "📦 Package Size: $([math]::Round($zxpSize, 2)) MB" -ForegroundColor Green
    }
    
    Write-Host "🎯 Target AE Version: $AEVersion" -ForegroundColor Green
    Write-Host "📂 CEP Extensions Path: $CEPExtensionsPath" -ForegroundColor Green
    Write-Host "🆔 Extension ID: $ExtensionID" -ForegroundColor Green
    Write-Host ""
}

# Main execution
Show-ExtensionInfo

if ($All) {
    $Install = $Test = $true
}

if ($Uninstall) {
    Uninstall-Extension
}

if ($Install) {
    $installSuccess = Install-Extension
    
    if ($installSuccess -and $Test) {
        Start-Sleep -Seconds 2
        Test-Extension
    }
} elseif ($Test) {
    Test-Extension
}

if (!$Install -and !$Test -and !$Uninstall) {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\deploy-extension.ps1 -Install    # Install the extension" -ForegroundColor White
    Write-Host "  .\deploy-extension.ps1 -Test       # Test installation" -ForegroundColor White
    Write-Host "  .\deploy-extension.ps1 -All        # Install and test" -ForegroundColor White
    Write-Host "  .\deploy-extension.ps1 -Uninstall  # Remove extension" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\deploy-extension.ps1 -All" -ForegroundColor Green
    Write-Host "  .\deploy-extension.ps1 -Install -AEVersion 2023" -ForegroundColor Green
}
