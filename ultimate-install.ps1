# Ultimate CEP Extension Installation Script
# This script tries multiple installation methods

Write-Host "🚀 Ultimate CEP Extension Installation" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Kill After Effects first
Write-Host "`n🛑 Stopping After Effects..." -ForegroundColor Yellow
Get-Process -Name "AfterFX" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 3

# Clear all possible extension locations
Write-Host "`n🧹 Clearing all extension installations..." -ForegroundColor Yellow
$allExtensionPaths = @(
    "$env:APPDATA\Adobe\CEP\extensions\com.letterblack.genai",
    "$env:ProgramFiles\Common Files\Adobe\CEP\extensions\com.letterblack.genai",
    "$env:ProgramFiles(x86)\Common Files\Adobe\CEP\extensions\com.letterblack.genai"
)

foreach ($path in $allExtensionPaths) {
    if (Test-Path $path) {
        Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  🗑️ Removed: $path" -ForegroundColor Gray
    }
}

# Set registry for ALL possible scenarios
Write-Host "`n🔧 Setting comprehensive registry configuration..." -ForegroundColor Yellow
$regSettings = @{
    "PlayerDebugMode" = "1"
    "LogLevel" = "6" 
    "EnableExtensionDebugging" = "1"
    "ExtensionDebugging" = "1"
}

$cepVersions = @("CSXS.6", "CSXS.7", "CSXS.8", "CSXS.9", "CSXS.10", "CSXS.11", "CSXS.12")
foreach ($version in $cepVersions) {
    $regPath = "HKCU:\SOFTWARE\Adobe\$version"
    if (!(Test-Path $regPath)) {
        New-Item -Path $regPath -Force | Out-Null
    }
    
    foreach ($setting in $regSettings.GetEnumerator()) {
        Set-ItemProperty -Path $regPath -Name $setting.Key -Value $setting.Value
    }
    Write-Host "  ✅ Configured $version" -ForegroundColor Green
}

# Method 1: User AppData installation (most common)
Write-Host "`n📦 Method 1: Installing to user directory..." -ForegroundColor Yellow
$userExtPath = "$env:APPDATA\Adobe\CEP\extensions\com.letterblack.genai"
if (!(Test-Path (Split-Path $userExtPath))) {
    New-Item -ItemType Directory -Path (Split-Path $userExtPath) -Force | Out-Null
}

# Build and copy extension
& .\debug-ae-extension.ps1 -Build | Out-Null
Copy-Item -Path "build\extension\*" -Destination $userExtPath -Recurse -Force
Write-Host "  ✅ Installed to: $userExtPath" -ForegroundColor Green

# Method 2: Try system-wide installation (requires admin)
Write-Host "`n📦 Method 2: Attempting system-wide installation..." -ForegroundColor Yellow
try {
    $systemExtPath = "$env:ProgramFiles\Common Files\Adobe\CEP\extensions\com.letterblack.genai"
    if (!(Test-Path (Split-Path $systemExtPath))) {
        New-Item -ItemType Directory -Path (Split-Path $systemExtPath) -Force | Out-Null
    }
    Copy-Item -Path "build\extension\*" -Destination $systemExtPath -Recurse -Force
    Write-Host "  ✅ Installed to: $systemExtPath" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️ System installation failed (may need admin rights)" -ForegroundColor Yellow
}

# Create multiple .debug files for redundancy
Write-Host "`n📄 Creating debug configuration files..." -ForegroundColor Yellow
$debugContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<ExtensionManifest ExtensionBundleId="com.letterblack.genai" ExtensionBundleVersion="1.0.0"
    Version="6.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <ExtensionList>
        <Extension Id="com.letterblack.genai" />
    </ExtensionList>
    <ExecutionEnvironment>
        <HostList>
            <Host Name="AEFT" Port="8000" />
        </HostList>
        <LocaleList>
            <Locale Code="All" />
        </LocaleList>
        <RequiredRuntimeList>
            <RequiredRuntime Name="CSXS" Version="6.0" />
        </RequiredRuntimeList>
    </ExecutionEnvironment>
    <DispatchInfoList>
        <Extension Id="com.letterblack.genai">
            <DispatchInfo>
                <Resources>
                    <MainPath>./index.html</MainPath>
                </Resources>
                <Lifecycle>
                    <AutoVisible>true</AutoVisible>
                </Lifecycle>
                <UI>
                    <Type>Panel</Type>
                    <Menu>LetterBlack GenAI</Menu>
                </UI>
            </DispatchInfo>
        </Extension>
    </DispatchInfoList>
</ExtensionManifest>
"@

foreach ($path in $allExtensionPaths) {
    if (Test-Path $path) {
        Set-Content -Path "$path\.debug" -Value $debugContent -Encoding UTF8
        Write-Host "  ✅ Created .debug in: $path" -ForegroundColor Green
    }
}

# Create CEP extension signature bypass
Write-Host "`n🔓 Creating signature bypass..." -ForegroundColor Yellow
$cepDirs = @(
    "$env:APPDATA\Adobe\CEP",
    "$env:ProgramFiles\Common Files\Adobe\CEP",
    "$env:ProgramFiles(x86)\Common Files\Adobe\CEP"
)

foreach ($cepDir in $cepDirs) {
    if (Test-Path $cepDir) {
        $signatureFile = "$cepDir\.signature"
        Set-Content -Path $signatureFile -Value "debug" -Encoding UTF8
        Write-Host "  ✅ Created signature bypass in: $cepDir" -ForegroundColor Green
    }
}

# Final verification
Write-Host "`n✅ Installation verification:" -ForegroundColor Green
foreach ($path in $allExtensionPaths) {
    if (Test-Path "$path\index.html") {
        Write-Host "  ✅ Extension installed: $path" -ForegroundColor Green
    }
}

# Launch After Effects with environment variables
Write-Host "`n🚀 Starting After Effects with debug environment..." -ForegroundColor Cyan

# Set CEP environment variables
$env:CEP_DEBUG_MODE = "1"
$env:ENABLE_NODE_JS_DEBUGGING = "1"

# Find After Effects
$aeExe = $null
$aePaths = @(
    "${env:ProgramFiles}\Adobe\Adobe After Effects*\Support Files\AfterFX.exe",
    "${env:ProgramFiles(x86)}\Adobe\Adobe After Effects*\Support Files\AfterFX.exe"
)

foreach ($pattern in $aePaths) {
    $found = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $aeExe = $found.FullName
        break
    }
}

if ($aeExe) {
    Write-Host "  🎬 Found After Effects: $aeExe" -ForegroundColor Green
    Start-Process -FilePath $aeExe
    Write-Host "  🚀 Started After Effects" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ After Effects not found - please start manually" -ForegroundColor Yellow
}

Write-Host "`n🎯 What to do next:" -ForegroundColor Cyan
Write-Host "1. Wait for After Effects to fully load (30+ seconds)" -ForegroundColor White
Write-Host "2. Go to Window > Extensions" -ForegroundColor White
Write-Host "3. Look for 'LetterBlack GenAI'" -ForegroundColor White
Write-Host "4. If not visible, try:" -ForegroundColor White
Write-Host "   • Window > Extensions > Browse for Extensions" -ForegroundColor Gray
Write-Host "   • Restart After Effects" -ForegroundColor Gray
Write-Host "   • Run as Administrator" -ForegroundColor Gray

Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "🎉 Ultimate installation complete!" -ForegroundColor Green
