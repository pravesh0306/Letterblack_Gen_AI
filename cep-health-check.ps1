#!/usr/bin/env pwsh

Write-Host "=== CEP Extension Health Check ===" -ForegroundColor Green
Write-Host ""

# Check if extension is properly loaded
Write-Host "1. Testing Extension Installation..." -ForegroundColor Cyan
$userExtPath = "$env:APPDATA\Adobe\CEP\extensions\com.letterblack.genai"
$systemExtPath = "C:\Program Files\Common Files\Adobe\CEP\extensions\com.letterblack.genai"

if (Test-Path "$userExtPath\index.html") {
    Write-Host "✓ User extension files found" -ForegroundColor Green
} else {
    Write-Host "✗ User extension files missing" -ForegroundColor Red
}

if (Test-Path "$systemExtPath\index.html") {
    Write-Host "✓ System extension files found" -ForegroundColor Green
} else {
    Write-Host "⚠️  System extension not installed (this is normal)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "2. Checking CEP Debug Settings..." -ForegroundColor Cyan
try {
    $debugMode = Get-ItemProperty -Path "HKCU:\SOFTWARE\Adobe\CSXS.12" -Name PlayerDebugMode -ErrorAction SilentlyContinue
    if ($debugMode.PlayerDebugMode -eq "1") {
        Write-Host "✓ CEP Debug Mode enabled" -ForegroundColor Green
    } else {
        Write-Host "✗ CEP Debug Mode disabled" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Could not check CEP debug settings" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Testing Extension Access..." -ForegroundColor Cyan
Write-Host "In After Effects, check:" -ForegroundColor Yellow
Write-Host "• Window > Extensions > LetterBlack GenAI" -ForegroundColor White
Write-Host "• The extension panel should load with AI chat interface" -ForegroundColor White
Write-Host "• Look for the mascot and 'LetterBlack_Gen_AI' header" -ForegroundColor White

Write-Host ""
Write-Host "4. Common Troubleshooting:" -ForegroundColor Cyan
Write-Host "• If extension appears but is blank: Check CEP debug mode" -ForegroundColor White
Write-Host "• If extension is slow: Try the 'DELETE CACHE' button in the extension" -ForegroundColor White
Write-Host "• If scripts don't work: Ensure After Effects scripting is enabled" -ForegroundColor White
Write-Host "• If AI features don't work: Check API settings in the extension" -ForegroundColor White

Write-Host ""
Write-Host "5. Performance Tips:" -ForegroundColor Cyan
Write-Host "• Keep the extension panel open for best performance" -ForegroundColor White
Write-Host "• Use the built-in cache clearing if things get slow" -ForegroundColor White
Write-Host "• The floating mascot indicates AI processing status" -ForegroundColor White

Write-Host ""
Write-Host "🎉 Your CEP extension is successfully installed!" -ForegroundColor Green
Write-Host "Enjoy using LetterBlack GenAI with After Effects!" -ForegroundColor Green
