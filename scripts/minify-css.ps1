#!/usr/bin/env pwsh
<#
.SYNOPSIS
    🎨 CSS Minification Script  
.DESCRIPTION
    Optimizes all CSS files in the build directory
#>

Write-Host "🎨 MINIFYING CSS FILES" -ForegroundColor Cyan

$buildDir = "com.letterblack.genai_Build"
$cssFiles = Get-ChildItem -Path "$buildDir\css" -Filter "*.css" -Recurse

if ($cssFiles.Count -eq 0) {
    Write-Host "⚠️ No CSS files found to minify" -ForegroundColor Yellow
    exit 0
}

Write-Host "🔍 Found $($cssFiles.Count) CSS files to process" -ForegroundColor Yellow

$totalOriginalSize = 0
$totalMinifiedSize = 0

foreach ($file in $cssFiles) {
    $originalSize = $file.Length
    $totalOriginalSize += $originalSize
    
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
    Write-Host "  📄 Processing: $relativePath" -ForegroundColor Gray
    
    try {
        # Simple CSS minification using PowerShell (basic approach)
        $content = Get-Content $file.FullName -Raw
        
        # Basic CSS minification
        $minified = $content -replace '/\*.*?\*/', '' `
                            -replace '\s+', ' ' `
                            -replace ';\s*}', '}' `
                            -replace '{\s*', '{' `
                            -replace '}\s*', '}' `
                            -replace ':\s*', ':' `
                            -replace ';\s*', ';'
        
        Set-Content -Path $file.FullName -Value $minified.Trim() -NoNewline
        
        $newSize = (Get-Item $file.FullName).Length
        $totalMinifiedSize += $newSize
        $savings = [math]::Round((1 - $newSize/$originalSize) * 100, 1)
        Write-Host "    ✅ Minified: $savings% smaller" -ForegroundColor Green
        
    } catch {
        Write-Host "    ⚠️ Warning: Error processing $($file.Name)" -ForegroundColor Yellow
        $totalMinifiedSize += $originalSize
    }
}

$totalSavings = [math]::Round((1 - $totalMinifiedSize/$totalOriginalSize) * 100, 1)
$originalSizeMB = [math]::Round($totalOriginalSize / 1MB, 2)
$minifiedSizeMB = [math]::Round($totalMinifiedSize / 1MB, 2)

Write-Host ""
Write-Host "CSS MINIFICATION SUMMARY:" -ForegroundColor Cyan
Write-Host "  Files processed: $($cssFiles.Count)" -ForegroundColor White
Write-Host "  Original size: $originalSizeMB MB" -ForegroundColor White
Write-Host "  Minified size: $minifiedSizeMB MB" -ForegroundColor White
Write-Host "  Total savings: $totalSavings%" -ForegroundColor Green

Write-Host "CSS minification complete!" -ForegroundColor Green
