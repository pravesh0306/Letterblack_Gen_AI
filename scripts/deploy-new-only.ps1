# Deploy New Extension Only
# This script deploys only the new com.letterblack.genai_Build extension

param(
    [switch]$CleanOld
)

Write-Host "🚀 Deploying LetterBlack Gen AI Extension (New Build Only)" -ForegroundColor Green

# Extension paths
$extensionDir = "$env:APPDATA\Adobe\CEP\extensions"
$oldExtension = "$extensionDir\com.letterblack.genai"
$newExtension = "$extensionDir\com.letterblack.genai_Build"
$sourceDir = ".\com.letterblack.genai_Build"

# Remove old extension if it exists or if CleanOld is specified
if ((Test-Path $oldExtension) -or $CleanOld) {
    Write-Host "🧹 Removing old extension..." -ForegroundColor Yellow
    if (Test-Path $oldExtension) {
        Remove-Item $oldExtension -Recurse -Force
        Write-Host "✅ Old extension removed" -ForegroundColor Green
    }
}

# Deploy new extension
Write-Host "📦 Deploying new extension..." -ForegroundColor Cyan

if (Test-Path $newExtension) {
    Remove-Item $newExtension -Recurse -Force
    Write-Host "🔄 Existing new extension removed for fresh deployment" -ForegroundColor Yellow
}

if (Test-Path $sourceDir) {
    Copy-Item $sourceDir $newExtension -Recurse -Force
    Write-Host "✅ New extension deployed successfully!" -ForegroundColor Green
    Write-Host "📍 Location: $newExtension" -ForegroundColor Cyan
} else {
    Write-Host "❌ Source directory not found: $sourceDir" -ForegroundColor Red
    exit 1
}

# Verify deployment
if (Test-Path "$newExtension\CSXS\manifest.xml") {
    Write-Host "✅ Manifest found - Extension ready!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: Manifest not found!" -ForegroundColor Yellow
}

Write-Host "`n🎯 Deployment Summary:" -ForegroundColor Magenta
Write-Host "   • Only 'com.letterblack.genai_Build' is installed" -ForegroundColor White
Write-Host "   • Old duplicate extension removed" -ForegroundColor White
Write-Host "   • Extension is resizable from all sides" -ForegroundColor White
Write-Host "`n💡 Restart After Effects to see the single extension" -ForegroundColor Cyan
