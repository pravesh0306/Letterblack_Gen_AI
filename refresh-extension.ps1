# Extension Refresh Script
Write-Host "🔄 Refreshing LetterBlack GenAI Extension" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

$extPath = "C:\Users\prave\AppData\Roaming\Adobe\CEP\extensions\com.letterblack.genai"

# Verify extension files
Write-Host "`n📋 Verifying extension files..." -ForegroundColor Yellow
$requiredFiles = @(
    "index.html",
    "CSXS\manifest.xml",
    ".debug",
    "css\design-system.css",
    "js\core\app.js",
    "host\main.jsx"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    $filePath = Join-Path $extPath $file
    if (Test-Path $filePath) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file MISSING!" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if ($allFilesExist) {
    Write-Host "`n✅ All required files present!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Some files are missing!" -ForegroundColor Red
}

Write-Host "`n🎯 To refresh the extension:" -ForegroundColor Cyan
Write-Host "1. In After Effects, close the LetterBlack GenAI panel if open" -ForegroundColor White
Write-Host "2. Go to Window > Extensions > LetterBlack GenAI" -ForegroundColor White
Write-Host "3. The panel should now show the complete UI" -ForegroundColor White
Write-Host ""
Write-Host "🔧 If the extension doesn't refresh:" -ForegroundColor Yellow
Write-Host "• Right-click in the extension panel and select 'Reload'" -ForegroundColor Gray
Write-Host "• Or restart After Effects completely" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 For debugging:" -ForegroundColor Yellow
Write-Host "• Open Chrome and go to: http://localhost:8000" -ForegroundColor Gray
Write-Host "• Click on the extension target to open DevTools" -ForegroundColor Gray

Write-Host "`n=======================================" -ForegroundColor Cyan
