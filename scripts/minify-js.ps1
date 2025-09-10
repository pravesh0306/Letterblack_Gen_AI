#!/usr/bin/env pwsh
<#
.SYNOPSIS
    📦 JavaScript Minification Script
.DESCRIPTION
    Optimizes all JavaScript files in the build directory using Terser
#>

Write-Host "📦 MINIFYING JAVASCRIPT FILES" -ForegroundColor Cyan

$buildDir = "com.letterblack.genai_Build"
$jsFiles = Get-ChildItem -Path "$buildDir\js" -Filter "*.js" -Recurse

if ($jsFiles.Count -eq 0) {
    Write-Host "⚠️ No JavaScript files found to minify" -ForegroundColor Yellow
    exit 0
}

Write-Host "🔍 Found $($jsFiles.Count) JavaScript files to minify" -ForegroundColor Yellow

$totalOriginalSize = 0
$totalMinifiedSize = 0
$processedFiles = 0

foreach ($file in $jsFiles) {
    $originalSize = $file.Length
    $totalOriginalSize += $originalSize
    
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
    Write-Host "  📄 Processing: $relativePath" -ForegroundColor Gray
    
    try {
        # Use terser to minify the file
        $outputFile = $file.FullName
        $result = & terser $file.FullName --compress --mangle --output $outputFile 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $newSize = (Get-Item $outputFile).Length
            $totalMinifiedSize += $newSize
            $savings = [math]::Round((1 - $newSize/$originalSize) * 100, 1)
            Write-Host "    ✅ Minified: $savings% smaller" -ForegroundColor Green
            $processedFiles++
        } else {
            Write-Host "    ⚠️ Warning: Could not minify $($file.Name)" -ForegroundColor Yellow
            $totalMinifiedSize += $originalSize
        }
    } catch {
        Write-Host "    ⚠️ Warning: Error processing $($file.Name)" -ForegroundColor Yellow
        $totalMinifiedSize += $originalSize
    }
}

$totalSavings = [math]::Round((1 - $totalMinifiedSize/$totalOriginalSize) * 100, 1)
$originalSizeMB = [math]::Round($totalOriginalSize / 1MB, 2)
$minifiedSizeMB = [math]::Round($totalMinifiedSize / 1MB, 2)

Write-Host ""
Write-Host "MINIFICATION SUMMARY:" -ForegroundColor Cyan
Write-Host "  Files processed: $processedFiles/$($jsFiles.Count)" -ForegroundColor White
Write-Host "  Original size: $originalSizeMB MB" -ForegroundColor White
Write-Host "  Minified size: $minifiedSizeMB MB" -ForegroundColor White
Write-Host "  Total savings: $totalSavings%" -ForegroundColor Green

Write-Host "JavaScript minification complete!" -ForegroundColor Green
