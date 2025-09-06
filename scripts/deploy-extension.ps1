# Deploy LetterBlack Gen AI Extension
# Updated to deploy only the new build and remove duplicates

Write-Host "🚀 LetterBlack Gen AI Extension Deployment" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

$extensionDir = "$env:APPDATA\Adobe\CEP\extensions"
$sourceDir = ".\com.letterblack.genai_Build"
$targetDir = "$extensionDir\com.letterblack.genai_Build"
$oldDir = "$extensionDir\com.letterblack.genai"

# Ensure CEP extensions directory exists
if (!(Test-Path $extensionDir)) {
    New-Item -ItemType Directory -Path $extensionDir -Force
    Write-Host "📁 Created CEP extensions directory" -ForegroundColor Yellow
}

# Remove old duplicate extension
if (Test-Path $oldDir) {
    Write-Host "🧹 Removing old duplicate extension..." -ForegroundColor Yellow
    Remove-Item $oldDir -Recurse -Force
    Write-Host "✅ Old extension removed" -ForegroundColor Green
}

# Remove existing new extension for clean deployment
if (Test-Path $targetDir) {
    Write-Host "🔄 Removing existing extension for fresh deployment..." -ForegroundColor Yellow
    Remove-Item $targetDir -Recurse -Force
}

# Deploy new extension
if (Test-Path $sourceDir) {
    Write-Host "📦 Copying extension files..." -ForegroundColor Cyan
    Copy-Item $sourceDir $targetDir -Recurse -Force
    
    if (Test-Path "$targetDir\CSXS\manifest.xml") {
        Write-Host "✅ Extension deployed successfully!" -ForegroundColor Green
        Write-Host "📍 Location: $targetDir" -ForegroundColor Cyan
        
        # Read extension info from manifest
        $manifest = Get-Content "$targetDir\CSXS\manifest.xml"
        $bundleName = ($manifest | Select-String 'ExtensionBundleName="([^"]*)"').Matches.Groups[1].Value
        $version = ($manifest | Select-String 'ExtensionBundleVersion="([^"]*)"').Matches.Groups[1].Value
        
        Write-Host "`n📋 Extension Details:" -ForegroundColor Magenta
        Write-Host "   Name: $bundleName" -ForegroundColor White
        Write-Host "   Version: $version" -ForegroundColor White
        Write-Host "   ID: com.letterblack.genai_Build" -ForegroundColor White
        Write-Host "   Resizable: ✅ All sides (350x450 to 1600x1200)" -ForegroundColor White
        
    } else {
        Write-Host "❌ Manifest file not found!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Source directory not found: $sourceDir" -ForegroundColor Red
    Write-Host "💡 Make sure you're running this from the project root" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Magenta
Write-Host "   1. Restart After Effects" -ForegroundColor White
Write-Host "   2. Go to Window > Extensions > LetterBlack Gen AI" -ForegroundColor White
Write-Host "   3. Only one extension should appear now" -ForegroundColor White
Write-Host "   4. Extension panel is fully resizable!" -ForegroundColor White

Write-Host "`n✨ Deployment Complete!" -ForegroundColor Green
