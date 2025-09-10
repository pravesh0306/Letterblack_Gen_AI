# Test the deployed extension functionality
Write-Host "🧪 Testing LetterBlack AI Chat Extension v2.0..." -ForegroundColor Cyan

$extensionPath = "C:\Users\prave\AppData\Roaming\Adobe\CEP\extensions\LetterBlack_AI_Chat"

# Verify deployment
Write-Host "📂 Checking deployment..." -ForegroundColor Yellow
if (Test-Path $extensionPath) {
    Write-Host "✅ Extension found at: $extensionPath" -ForegroundColor Green
} else {
    Write-Host "❌ Extension not found!" -ForegroundColor Red
    exit 1
}

# Check manifest
$manifestPath = Join-Path $extensionPath "CSXS\manifest.xml"
if (Test-Path $manifestPath) {
    Write-Host "✅ Manifest found" -ForegroundColor Green
    $manifest = Get-Content $manifestPath -Raw
    if ($manifest -match "enable-nodejs") {
        Write-Host "✅ Node.js support enabled" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Node.js support not found in manifest" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Manifest not found!" -ForegroundColor Red
}

# Check main files
$files = @(
    "index.html",
    "js\simple-chat.js",
    "js\config.js",
    "js\config.local.js",
    "host-script.jsx"
)

Write-Host "📄 Checking core files..." -ForegroundColor Yellow
foreach ($file in $files) {
    $filePath = Join-Path $extensionPath $file
    if (Test-Path $filePath) {
        $size = (Get-Item $filePath).Length
        Write-Host "✅ $file ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing: $file" -ForegroundColor Red
    }
}

# Check enhanced features in simple-chat.js
$chatPath = Join-Path $extensionPath "js\simple-chat.js"
$chatContent = Get-Content $chatPath -Raw

$features = @(
    "classifyIntent",
    "getAEContext", 
    "buildEnhancedPrompt",
    "formatResponseWithContext",
    "Intent Classification System"
)

Write-Host "🎯 Checking enhanced features..." -ForegroundColor Yellow
foreach ($feature in $features) {
    if ($chatContent -match $feature) {
        Write-Host "✅ $feature found" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing: $feature" -ForegroundColor Red
    }
}

# Line count verification
$lineCount = (Get-Content $chatPath | Measure-Object -Line).Lines
Write-Host "📊 simple-chat.js: $lineCount lines" -ForegroundColor Cyan
if ($lineCount -gt 900) {
    Write-Host "✅ Enhanced version deployed (expected 969 lines)" -ForegroundColor Green
} else {
    Write-Host "⚠️ May be older version (expected 969 lines)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 DEPLOYMENT VERIFICATION COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 NEXT STEPS:" -ForegroundColor Magenta
Write-Host "  1. Restart After Effects" -ForegroundColor White
Write-Host "  2. Open: Window > Extensions > LetterBlack AI Chat" -ForegroundColor White
Write-Host "  3. Configure API key in Settings" -ForegroundColor White
Write-Host "  4. Test with: 'wiggle expression for position'" -ForegroundColor White
Write-Host ""
Write-Host "🧠 NEW SMART FEATURES:" -ForegroundColor Cyan
Write-Host "  • Intent Classification (analyzes your requests)" -ForegroundColor White
Write-Host "  • AE Context Awareness (knows your current comp/layers)" -ForegroundColor White
Write-Host "  • Enhanced AI Prompting (specialized responses)" -ForegroundColor White
Write-Host "  • Context Cards (helpful workflow tips)" -ForegroundColor White
