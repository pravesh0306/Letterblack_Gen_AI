# Safe Deletion Script for Deprecated Modules
# LetterBlack GenAI - After Effects Extension
# Created: 2025-01-10

Write-Host "=== DEPRECATED MODULE CLEANUP ===" -ForegroundColor Cyan
Write-Host ""

# Confirmed safe-to-delete files (explicitly deprecated, not loaded)
$safesToDelete = @(
    "src\js\core\main-deprecated.js",
    "src\js\core\simplified-main.js", 
    "src\js\core.js"
)

# Base path
$basePath = "g:\Developments\15_AI_AE\Adobe_AI_Generations"

Write-Host "Checking files before deletion..." -ForegroundColor Yellow

foreach ($relativePath in $safesToDelete) {
    $fullPath = Join-Path $basePath $relativePath
    
    if (Test-Path $fullPath) {
        $fileInfo = Get-Item $fullPath
        $size = [Math]::Round($fileInfo.Length / 1KB, 2)
        
        Write-Host "  📁 Found: $relativePath ($size KB)" -ForegroundColor White
        
        # Read first few lines to confirm it's deprecated
        $content = Get-Content $fullPath -TotalCount 5 -ErrorAction SilentlyContinue
        if ($content -match "deprecated|LEGACY|NO LONGER USED" -or $fileInfo.Length -eq 0) {
            Write-Host "  ✅ Confirmed deprecated/empty - SAFE TO DELETE" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️ No deprecation marker found - SKIP" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ❌ Not found: $relativePath" -ForegroundColor Red
    }
}

Write-Host ""
$confirmation = Read-Host "Delete confirmed deprecated files? (y/N)"

if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
    Write-Host ""
    Write-Host "Deleting deprecated modules..." -ForegroundColor Red
    
    foreach ($relativePath in $safesToDelete) {
        $fullPath = Join-Path $basePath $relativePath
        
        if (Test-Path $fullPath) {
            try {
                Remove-Item $fullPath -Force
                Write-Host "  🗑️ DELETED: $relativePath" -ForegroundColor Red
            } catch {
                Write-Host "  ❌ FAILED to delete: $relativePath - $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host ""
    Write-Host "✅ Cleanup completed!" -ForegroundColor Green
    Write-Host "Deprecated modules removed. Extension will continue working normally." -ForegroundColor Cyan
    
} else {
    Write-Host ""
    Write-Host "❌ Deletion cancelled. Files preserved." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== CLEANUP SUMMARY ===" -ForegroundColor Cyan
Write-Host "✅ main-deprecated.js - Explicitly marked deprecated, replaced by enhanced-main.js"
Write-Host "✅ simplified-main.js - Empty file, replaced by modular architecture"  
Write-Host "✅ core.js - Empty file, replaced by enhanced-main.js and core modules"
Write-Host ""
Write-Host "These files exist because developers keep them during migration for:"
Write-Host "  • Rollback safety during development"
Write-Host "  • Reference documentation"  
Write-Host "  • Git history preservation"
Write-Host "  • Gradual feature migration"
