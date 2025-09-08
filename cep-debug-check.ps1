# CEP Extension Debug Helper

Write-Host "🔍 CEP Extension Debug Check" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# Check debug mode
Write-Host "`n📋 Checking CEP Debug Mode..." -ForegroundColor Yellow

$debugModes = @(
    "HKEY_CURRENT_USER\Software\Adobe\CSXS.9",
    "HKEY_CURRENT_USER\Software\Adobe\CSXS.10", 
    "HKEY_CURRENT_USER\Software\Adobe\CSXS.11"
)

foreach ($path in $debugModes) {
    try {
        $value = reg query $path /v PlayerDebugMode 2>$null
        if ($value) {
            Write-Host "   ✅ $path - Debug mode enabled" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $path - Debug mode not set" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ $path - Not found" -ForegroundColor Red
    }
}

# List extensions
Write-Host "`n📋 Installed CEP Extensions:" -ForegroundColor Yellow
$extensions = Get-ChildItem "C:\Users\prave\AppData\Roaming\Adobe\CEP\extensions\" -ErrorAction SilentlyContinue
if ($extensions) {
    foreach ($ext in $extensions) {
        $manifestPath = Join-Path $ext.FullName "CSXS\manifest.xml"
        if (Test-Path $manifestPath) {
            $manifest = Get-Content $manifestPath -Raw
            if ($manifest -match 'ExtensionBundleName="([^"]*)"') {
                Write-Host "   ✅ $($ext.Name) - $($matches[1])" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️ $($ext.Name) - No bundle name found" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   ❌ $($ext.Name) - Missing manifest" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ❌ No extensions found" -ForegroundColor Red
}

# Check After Effects processes
Write-Host "`n📋 After Effects Processes:" -ForegroundColor Yellow
$aeProcesses = Get-Process -Name "*After*" -ErrorAction SilentlyContinue
if ($aeProcesses) {
    foreach ($proc in $aeProcesses) {
        Write-Host "   🎯 $($proc.Name) - PID: $($proc.Id)" -ForegroundColor Green
    }
    Write-Host "`n⚠️ After Effects is running. You may need to restart AE to see new extensions." -ForegroundColor Yellow
} else {
    Write-Host "   ✅ No After Effects processes running" -ForegroundColor Green
}

Write-Host "`n🎯 Recommendations:" -ForegroundColor Cyan
Write-Host "   1. Restart After Effects completely" -ForegroundColor White
Write-Host "   2. Check Window > Extensions menu" -ForegroundColor White
Write-Host "   3. Look for 'CodeBlock Test' in the menu" -ForegroundColor White
Write-Host "   4. If not visible, check AE version compatibility" -ForegroundColor White

Write-Host "`n✨ Debug Check Complete!" -ForegroundColor Green
