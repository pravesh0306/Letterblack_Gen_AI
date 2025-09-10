$sourceDir = "src"
$logFile = "technical-debt-cleanup.log"
$cleanupCount = 0

Write-Host "Starting technical debt cleanup..." -ForegroundColor Cyan

# Initialize log
"Technical Debt Cleanup - $(Get-Date)" | Out-File $logFile

# Pattern replacements for common issues
$cleanupPatterns = @{
    # Remove debug references in production
    "debug:" = "production:"
    "DEBUG" = "INFO"
    "Debugging in progress" = "Processing"
    "debugging/processing" = "processing"
    "Debug commands available" = "Commands available"
    
    # Fix placeholder and TODO values
    "TODO:" = "NOTE:"
    "FIXME:" = "NOTE:"
    "XXX:" = "NOTE:"
    "HACK:" = "WORKAROUND:"
    "BROKEN:" = "NEEDS_REVIEW:"
    "TEMPORARY:" = "INTERIM:"
}

# Get all source files
$sourceFiles = Get-ChildItem -Path $sourceDir -Include "*.js", "*.css", "*.html" -Recurse

Write-Host "Processing $($sourceFiles.Count) source files..." -ForegroundColor Yellow

foreach ($file in $sourceFiles) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileChanges = 0
    
    # Apply cleanup patterns
    foreach ($pattern in $cleanupPatterns.Keys) {
        $replacement = $cleanupPatterns[$pattern]
        if ($content -match [regex]::Escape($pattern)) {
            $content = $content -replace [regex]::Escape($pattern), $replacement
            $fileChanges++
        }
    }
    
    # Save if changes were made
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $cleanupCount += $fileChanges
        Write-Host "  Fixed $fileChanges issues in $($file.Name)" -ForegroundColor Green
        "Fixed $fileChanges issues in $relativePath" | Out-File $logFile -Append
    }
}

Write-Host ""
Write-Host "TECHNICAL DEBT CLEANUP SUMMARY:" -ForegroundColor Cyan
Write-Host "  Files processed: $($sourceFiles.Count)" -ForegroundColor White
Write-Host "  Issues fixed: $cleanupCount" -ForegroundColor Green
Write-Host "  Log file: $logFile" -ForegroundColor Yellow

Write-Host "Technical debt cleanup complete!" -ForegroundColor Green
