# LetterBlack AI Chat Extension - Deployment Script
# This script copies the extension to the Adobe CEP extensions folder

param(
    [switch]$Force,
    [switch]$Verbose
)

Write-Host "🚀 Deploying LetterBlack AI Chat Extension v2.0..." -ForegroundColor Cyan

# Define paths
$projectRoot = Split-Path $PSScriptRoot -Parent
$srcPath = Join-Path $projectRoot "src"
$extensionName = "LetterBlack_AI_Chat"

# Adobe CEP Extensions paths (try multiple locations)
$cepPaths = @(
    "$env:APPDATA\Adobe\CEP\extensions",
    "$env:USERPROFILE\AppData\Roaming\Adobe\CEP\extensions",
    "C:\Program Files (x86)\Common Files\Adobe\CEP\extensions",
    "C:\Program Files\Common Files\Adobe\CEP\extensions"
)

# Find the correct CEP path
$targetPath = $null
foreach ($path in $cepPaths) {
    if (Test-Path $path) {
        $targetPath = Join-Path $path $extensionName
        Write-Host "✅ Found CEP extensions folder: $path" -ForegroundColor Green
        break
    }
}

if (-not $targetPath) {
    Write-Host "❌ Could not find Adobe CEP extensions folder" -ForegroundColor Red
    Write-Host "Tried the following paths:" -ForegroundColor Yellow
    $cepPaths | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    
    # Create the default path
    $defaultPath = "$env:APPDATA\Adobe\CEP\extensions"
    Write-Host "Creating default CEP extensions folder: $defaultPath" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $defaultPath -Force | Out-Null
    $targetPath = Join-Path $defaultPath $extensionName
}

Write-Host "📂 Target installation path: $targetPath" -ForegroundColor Yellow

# Remove existing installation if it exists
if (Test-Path $targetPath) {
    if ($Force) {
        Write-Host "🗑️ Removing existing installation..." -ForegroundColor Yellow
        Remove-Item $targetPath -Recurse -Force
    } else {
        $response = Read-Host "Extension already exists. Overwrite? (y/N)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            Remove-Item $targetPath -Recurse -Force
        } else {
            Write-Host "❌ Deployment cancelled" -ForegroundColor Red
            exit 1
        }
    }
}

# Create target directory
Write-Host "📁 Creating extension directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $targetPath -Force | Out-Null

# Copy files
Write-Host "📋 Copying extension files..." -ForegroundColor Yellow

try {
    # Copy all source files
    Copy-Item -Path "$srcPath\*" -Destination $targetPath -Recurse -Force
    
    Write-Host "✅ Extension deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Installation location: $targetPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎯 NEW FEATURES IN v2.0:" -ForegroundColor Magenta
    Write-Host "  • Smart Intent Classification" -ForegroundColor White
    Write-Host "  • AE Context Awareness" -ForegroundColor White
    Write-Host "  • Enhanced AI Prompting" -ForegroundColor White
    Write-Host "  • Context-aware Responses" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 TO USE:" -ForegroundColor Green
    Write-Host "  1. Restart After Effects" -ForegroundColor White
    Write-Host "  2. Go to Window > Extensions > LetterBlack AI Chat" -ForegroundColor White
    Write-Host "  3. Configure your Gemini API key in Settings" -ForegroundColor White
    Write-Host "  4. Try: 'wiggle for position' or 'script to organize layers'" -ForegroundColor White
    Write-Host ""
    
    # Show files copied
    if ($Verbose) {
        Write-Host "📄 Files deployed:" -ForegroundColor Yellow
        Get-ChildItem $targetPath -Recurse | ForEach-Object {
            $relativePath = $_.FullName.Replace($targetPath, "").TrimStart('\')
            Write-Host "  • $relativePath" -ForegroundColor Gray
        }
    }
    
} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Deployment complete! Restart After Effects to see the enhanced extension." -ForegroundColor Green
