# CEP Extension Troubleshooting Script
# Comprehensive fix for extension not appearing in After Effects

Write-Host "🔧 CEP Extension Troubleshooting" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Check and create CEP folder structure
Write-Host "`n📁 Setting up CEP directories..." -ForegroundColor Yellow

$cepRoot = "$env:APPDATA\Adobe\CEP"
$extensionsDir = "$cepRoot\extensions"
$extensionDir = "$extensionsDir\com.letterblack.genai"

# Ensure directories exist
@($cepRoot, $extensionsDir) | ForEach-Object {
    if (!(Test-Path $_)) {
        New-Item -ItemType Directory -Path $_ -Force | Out-Null
        Write-Host "  ✅ Created: $_" -ForegroundColor Green
    } else {
        Write-Host "  ✅ Exists: $_" -ForegroundColor Green
    }
}

# Clear any existing CEP cache
Write-Host "`n🧹 Clearing CEP cache..." -ForegroundColor Yellow
$cacheLocations = @(
    "$env:APPDATA\Adobe\CEP\cache",
    "$env:LOCALAPPDATA\Adobe\CEP\cache",
    "$env:TEMP\Adobe\CEP"
)

foreach ($cache in $cacheLocations) {
    if (Test-Path $cache) {
        Remove-Item -Path $cache -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  🗑️ Cleared: $cache" -ForegroundColor Gray
    }
}

# Check for conflicting extension installations
Write-Host "`n🔍 Checking for conflicting installations..." -ForegroundColor Yellow
$possibleLocations = @(
    "$env:PROGRAMFILES\Common Files\Adobe\CEP\extensions",
    "$env:PROGRAMFILES(X86)\Common Files\Adobe\CEP\extensions",
    "$env:APPDATA\Adobe\CEP\extensions"
)

foreach ($location in $possibleLocations) {
    if (Test-Path $location) {
        $conflicts = Get-ChildItem -Path $location -Directory | Where-Object { $_.Name -like "*letterblack*" -or $_.Name -like "*genai*" }
        if ($conflicts) {
            foreach ($conflict in $conflicts) {
                Write-Host "  ⚠️ Found conflicting extension: $($conflict.FullName)" -ForegroundColor Yellow
                Write-Host "     Consider removing: $($conflict.FullName)" -ForegroundColor Gray
            }
        }
    }
}

# Enhanced registry settings for maximum compatibility
Write-Host "`n🔧 Setting enhanced registry configuration..." -ForegroundColor Yellow

# Set for all possible CEP versions
$cepVersions = @("CSXS.8", "CSXS.9", "CSXS.10", "CSXS.11", "CSXS.12")
foreach ($version in $cepVersions) {
    $regPath = "HKCU:\SOFTWARE\Adobe\$version"
    if (!(Test-Path $regPath)) {
        New-Item -Path $regPath -Force | Out-Null
    }
    
    # Set all required debug properties
    Set-ItemProperty -Path $regPath -Name "PlayerDebugMode" -Value "1"
    Set-ItemProperty -Path $regPath -Name "LogLevel" -Value "6"
    Set-ItemProperty -Path $regPath -Name "EnableExtensionDebugging" -Value "1"
    
    Write-Host "  ✅ Configured $version" -ForegroundColor Green
}

# Check After Effects version compatibility
Write-Host "`n🎬 Checking After Effects compatibility..." -ForegroundColor Yellow

# Look for After Effects installation
$aeLocations = @(
    "${env:ProgramFiles}\Adobe\Adobe After Effects *",
    "${env:ProgramFiles(x86)}\Adobe\Adobe After Effects *"
)

$aeFound = $false
foreach ($location in $aeLocations) {
    $aePaths = Get-ChildItem -Path $location -Directory -ErrorAction SilentlyContinue
    if ($aePaths) {
        foreach ($aePath in $aePaths) {
            Write-Host "  ✅ Found: $($aePath.Name)" -ForegroundColor Green
            $aeFound = $true
        }
    }
}

if (-not $aeFound) {
    Write-Host "  ⚠️ After Effects installation not found in standard locations" -ForegroundColor Yellow
}

# Create .debug file for extension
Write-Host "`n📄 Creating .debug file..." -ForegroundColor Yellow
$debugFile = "$extensionDir\.debug"
$debugContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<ExtensionManifest ExtensionBundleId="com.letterblack.genai" ExtensionBundleVersion="1.0.0"
    Version="9.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
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
            <RequiredRuntime Name="CSXS" Version="9.0" />
        </RequiredRuntimeList>
    </ExecutionEnvironment>
    <DispatchInfoList>
        <Extension Id="com.letterblack.genai">
            <DispatchInfo>
                <Resources>
                    <MainPath>./index.html</MainPath>
                    <ScriptPath>./host/main.jsx</ScriptPath>
                </Resources>
                <Lifecycle>
                    <AutoVisible>true</AutoVisible>
                </Lifecycle>
                <UI>
                    <Type>Panel</Type>
                    <Menu>LetterBlack_Gen_AI v2.0.2</Menu>
                </UI>
            </DispatchInfo>
        </Extension>
    </DispatchInfoList>
</ExtensionManifest>
"@

Set-Content -Path $debugFile -Value $debugContent -Encoding UTF8
Write-Host "  ✅ Created .debug file: $debugFile" -ForegroundColor Green

# Final verification
Write-Host "`n✅ Final verification:" -ForegroundColor Green
if (Test-Path "$extensionDir\index.html") {
    Write-Host "  ✅ Extension files present" -ForegroundColor Green
} else {
    Write-Host "  ❌ Extension files missing" -ForegroundColor Red
}

if (Test-Path "$extensionDir\CSXS\manifest.xml") {
    Write-Host "  ✅ Manifest file present" -ForegroundColor Green
} else {
    Write-Host "  ❌ Manifest file missing" -ForegroundColor Red
}

# Instructions
Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. 🚀 Start After Effects" -ForegroundColor White
Write-Host "2. 🔄 Wait for full startup (important!)" -ForegroundColor White
Write-Host "3. 📱 Go to Window > Extensions" -ForegroundColor White
Write-Host "4. 🔍 Look for 'LetterBlack_Gen_AI v2.0.2'" -ForegroundColor White
Write-Host "5. 📋 If not visible, try Window > Extensions > Browse for Extensions" -ForegroundColor White

Write-Host "`n🔧 If still not working:" -ForegroundColor Yellow
Write-Host "• Restart computer (clears all Adobe caches)" -ForegroundColor Gray
Write-Host "• Run After Effects as Administrator" -ForegroundColor Gray
Write-Host "• Check Windows Event Viewer for CEP errors" -ForegroundColor Gray
Write-Host "• Temporarily disable antivirus/firewall" -ForegroundColor Gray

Write-Host "`n====================================" -ForegroundColor Cyan
Write-Host "🎉 Troubleshooting complete!" -ForegroundColor Green
