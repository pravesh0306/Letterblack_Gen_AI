# CORRECTED ORPHANED MODULE ANALYSIS
# LetterBlack GenAI - After Effects Extension
# Date: September 8, 2025

Write-Host "=== CORRECTED ORPHANED MODULE ANALYSIS ===" -ForegroundColor Cyan
Write-Host ""

# Get all loaded scripts from HTML (with correct path extraction)
$htmlContent = Get-Content "g:\Developments\15_AI_AE\Adobe_AI_Generations\src\indexBackup.html" -Raw
$loadedScripts = [regex]::Matches($htmlContent, 'src="([^"]+\.js)"') | 
    Where-Object { $_.Groups[1].Value -notmatch "https?://" } | 
    ForEach-Object { $_.Groups[1].Value }

Write-Host "📋 Scripts loaded in HTML: $($loadedScripts.Count)" -ForegroundColor Green
Write-Host ""

# Get all JS files in src directory 
$allSrcFiles = Get-ChildItem -Path "g:\Developments\15_AI_AE\Adobe_AI_Generations\src" -Recurse -Include "*.js" |
    Where-Object { $_.FullName -notmatch "libs|fontawesome|prism" }

# Convert file paths to relative paths for comparison
$allSrcRelativePaths = $allSrcFiles | ForEach-Object {
    $relativePath = $_.FullName.Replace("g:\Developments\15_AI_AE\Adobe_AI_Generations\src\", "").Replace("\", "/")
    [PSCustomObject]@{
        File = $_
        RelativePath = $relativePath
    }
}

Write-Host "📁 All JS files in src: $($allSrcFiles.Count)" -ForegroundColor Cyan
Write-Host ""

# Find truly orphaned files
$orphanedFiles = $allSrcRelativePaths | Where-Object { $_.RelativePath -notin $loadedScripts }

Write-Host "🗑️ TRULY ORPHANED: $($orphanedFiles.Count) modules" -ForegroundColor Red
Write-Host ""

# Show sample loaded vs orphaned for verification
Write-Host "📋 SAMPLE LOADED SCRIPTS:" -ForegroundColor Green
$loadedScripts | Select-Object -First 5 | ForEach-Object { Write-Host "   ✅ $_" -ForegroundColor Green }
Write-Host ""

Write-Host "🗑️ SAMPLE ORPHANED FILES:" -ForegroundColor Red  
$orphanedFiles | Select-Object -First 5 | ForEach-Object { Write-Host "   ❌ $($_.RelativePath)" -ForegroundColor Red }
Write-Host ""

# List largest orphaned files for manual review
Write-Host "🔍 LARGEST ORPHANED FILES FOR REVIEW:" -ForegroundColor Yellow
$orphanedFilesSorted = $orphanedFiles | Sort-Object { $_.File.Length } -Descending | Select-Object -First 10
foreach ($item in $orphanedFilesSorted) {
    $sizeKB = [Math]::Round($item.File.Length / 1KB, 1)
    Write-Host "   📄 $($item.RelativePath) - $sizeKB KB" -ForegroundColor White
}
Write-Host ""

Write-Host "=== VERIFICATION ===" -ForegroundColor Magenta
Write-Host "Total files in src/: $($allSrcFiles.Count)"
Write-Host "Loaded in HTML: $($loadedScripts.Count)" 
Write-Host "Truly orphaned: $($orphanedFiles.Count)"
Write-Host "Math check: $($allSrcFiles.Count) - $($loadedScripts.Count) = $($allSrcFiles.Count - $loadedScripts.Count)"
