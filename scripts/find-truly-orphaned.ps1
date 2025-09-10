# DEFINITIVE ORPHANED MODULES ANALYSIS
# LetterBlack GenAI - After Effects Extension
# Date: September 8, 2025

Write-Host "=== DEFINITIVE ORPHANED MODULE ANALYSIS ===" -ForegroundColor Red
Write-Host ""

# Get all loaded scripts from HTML
$htmlContent = Get-Content "g:\Developments\15_AI_AE\Adobe_AI_Generations\src\indexBackup.html" -Raw
$loadedScripts = [regex]::Matches($htmlContent, '<script src="([^"]+\.js)"') | 
    Where-Object { $_.Groups[1].Value -notmatch "https?://" } |
    ForEach-Object { 
        $path = $_.Groups[1].Value
        if ($path.StartsWith("js/")) {
            $path.Substring(3)  # Remove "js/" prefix
        } else {
            $path
        }
    }

Write-Host "📋 LOADED SCRIPTS IN HTML: $($loadedScripts.Count)" -ForegroundColor Green
Write-Host ""

# Get all JS files in src directory (excluding external libs)
$allSrcFiles = Get-ChildItem -Path "g:\Developments\15_AI_AE\Adobe_AI_Generations\src" -Recurse -Include "*.js" |
    Where-Object { $_.FullName -notmatch "libs|fontawesome|prism" } |
    ForEach-Object { 
        $relativePath = $_.FullName.Replace("g:\Developments\15_AI_AE\Adobe_AI_Generations\src\", "").Replace("\", "/")
        if ($relativePath.StartsWith("js/")) {
            $relativePath.Substring(3)
        } else {
            $relativePath
        }
    }

Write-Host "📁 ALL JS FILES IN SRC: $($allSrcFiles.Count)" -ForegroundColor Cyan
Write-Host ""

# Find truly orphaned files
$orphanedFiles = $allSrcFiles | Where-Object { $_ -notin $loadedScripts }

Write-Host "🗑️ TRULY ORPHANED MODULES: $($orphanedFiles.Count)" -ForegroundColor Red
Write-Host ""

# Categorize orphaned files
Write-Host "=== CATEGORIZED ORPHANED MODULES ===" -ForegroundColor Yellow
Write-Host ""

# 1. Deprecated/Empty files
$deprecated = $orphanedFiles | Where-Object { $_ -match "deprecated|main\.js$|core\.js$|simplified" }
if ($deprecated) {
    Write-Host "🗑️ DEPRECATED/EMPTY (Safe to delete):" -ForegroundColor Red
    $deprecated | ForEach-Object { Write-Host "   ❌ $_" -ForegroundColor Red }
    Write-Host ""
}

# 2. Init directory modules
$initFiles = $orphanedFiles | Where-Object { $_ -match "^init/" }
if ($initFiles) {
    Write-Host "🔧 INIT MODULES (Not yet integrated):" -ForegroundColor Yellow
    $initFiles | ForEach-Object { Write-Host "   📄 $_" -ForegroundColor Yellow }
    Write-Host ""
}

# 3. Utility modules
$utilFiles = $orphanedFiles | Where-Object { $_ -match "^utils/" -and $_ -notin $deprecated }
if ($utilFiles) {
    Write-Host "🛠️ ORPHANED UTILITIES:" -ForegroundColor Cyan
    $utilFiles | ForEach-Object { Write-Host "   🔧 $_" -ForegroundColor Cyan }
    Write-Host ""
}

# 4. Core modules
$coreFiles = $orphanedFiles | Where-Object { $_ -match "^core/" -and $_ -notin $deprecated }
if ($coreFiles) {
    Write-Host "🏗️ ORPHANED CORE MODULES:" -ForegroundColor Magenta
    $coreFiles | ForEach-Object { Write-Host "   🏗️ $_" -ForegroundColor Magenta }
    Write-Host ""
}

# 5. Other orphaned files
$otherFiles = $orphanedFiles | Where-Object { 
    $_ -notmatch "^(init|utils|core)/" -and $_ -notin $deprecated 
}
if ($otherFiles) {
    Write-Host "📦 OTHER ORPHANED MODULES:" -ForegroundColor White
    $otherFiles | ForEach-Object { Write-Host "   📄 $_" -ForegroundColor White }
    Write-Host ""
}

Write-Host "=== SUMMARY ===" -ForegroundColor Green
Write-Host "Total JS files in src/: $($allSrcFiles.Count)" -ForegroundColor White
Write-Host "Loaded in HTML: $($loadedScripts.Count)" -ForegroundColor Green
Write-Host "Truly orphaned: $($orphanedFiles.Count)" -ForegroundColor Red
Write-Host "Deprecated (safe to delete): $($deprecated.Count)" -ForegroundColor Red

if ($deprecated.Count -gt 0) {
    Write-Host ""
    Write-Host "✅ RECOMMENDATION: Delete the $($deprecated.Count) deprecated files" -ForegroundColor Green
    Write-Host "⚠️ EVALUATE: Review the remaining $($orphanedFiles.Count - $deprecated.Count) orphaned modules" -ForegroundColor Yellow
}
