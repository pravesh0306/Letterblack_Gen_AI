#!/usr/bin/env pwsh
<#
.SYNOPSIS
    🎁 Production ZXP Package Creator - Quality First Phase
.DESCRIPTION
    Creates optimized, production-ready ZXP package for Adobe Extension marketplace
.NOTES
    Part of Phase 3: Quality First - Professional packaging
#>

Write-Host "🎁 CREATING PRODUCTION ZXP PACKAGE" -ForegroundColor Cyan
Write-Host "=" * 40 -ForegroundColor Gray

$buildDir = "com.letterblack.genai_Build"
$packageName = "letterblack-gen-ai-v$(Get-Date -Format 'yyyy.MM.dd')"
$outputFile = "$packageName.zxp"

# Verify build exists
if (!(Test-Path $buildDir)) {
    Write-Host "❌ Build directory not found. Run 'npm run build' first." -ForegroundColor Red
    exit 1
}

Write-Host "📁 Build directory: $buildDir" -ForegroundColor Yellow
Write-Host "📦 Package name: $packageName" -ForegroundColor Yellow

# Calculate build size
$buildSize = (Get-ChildItem $buildDir -Recurse | Measure-Object -Property Length -Sum).Sum
$buildSizeMB = [math]::Round($buildSize / 1MB, 2)
Write-Host "📊 Build size: $buildSizeMB MB" -ForegroundColor Green

# Create ZXP package using ZIP compression
Write-Host "Creating ZXP package..." -ForegroundColor Yellow

$packageSize = 0
try {
    # Use PowerShell's built-in compression
    Compress-Archive -Path "$buildDir\*" -DestinationPath "$packageName.zip" -Force
    
    # Rename to .zxp extension
    if (Test-Path "$packageName.zip") {
        Rename-Item "$packageName.zip" $outputFile -Force
    }
    
    $packageSize = (Get-Item $outputFile).Length
    $packageSizeMB = [math]::Round($packageSize / 1MB, 2)
    
    Write-Host ""
    Write-Host "ZXP PACKAGE CREATED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "File: $outputFile" -ForegroundColor White
    Write-Host "Size: $packageSizeMB MB" -ForegroundColor White
    
    if ($buildSize -gt 0) {
        $compressionRatio = [math]::Round((1 - $packageSize/$buildSize) * 100, 1)
        Write-Host "Compression: $compressionRatio% smaller" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "INSTALLATION INSTRUCTIONS:" -ForegroundColor Cyan
    Write-Host "1. Use Adobe Extension Manager CC" -ForegroundColor White
    Write-Host "2. Or use ZXPInstaller (anastasiy.com/ZXPInstaller)" -ForegroundColor White
    Write-Host "3. Or use command: ExMan install $outputFile" -ForegroundColor White
    
} catch {
    Write-Host "Failed to create ZXP package: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Production packaging complete!" -ForegroundColor Green
