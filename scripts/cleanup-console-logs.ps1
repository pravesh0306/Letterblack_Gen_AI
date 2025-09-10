#!/usr/bin/env pwsh
Write-Host "🔧 CLEANING UP CONSOLE LOGS IN SOURCE FILES..." -ForegroundColor Cyan

$sourceFiles = Get-ChildItem -Path "src" -Include "*.js" -Recurse
$modifiedFiles = 0

foreach ($file in $sourceFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    if ($content -match 'console\.(log|warn|error|debug)') {
        Write-Host "📝 Processing: $($file.Name)" -ForegroundColor Yellow
        
        $content = $content -replace 'console\.log\(', 'this.logger.debug('
        $content = $content -replace 'console\.warn\(', 'this.logger.warn('
        $content = $content -replace 'console\.error\(', 'this.logger.error('
        $content = $content -replace 'console\.debug\(', 'this.logger.debug('
        
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $modifiedFiles++
        
        Write-Host "   ✅ Fixed console logs in $($file.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎯 CLEANUP SUMMARY:" -ForegroundColor Green
Write-Host "   📁 Files modified: $modifiedFiles" -ForegroundColor White
Write-Host "   ✅ Console log cleanup complete!" -ForegroundColor Green
