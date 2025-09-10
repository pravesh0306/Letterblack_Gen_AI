Write-Host "🧹 TECHNICAL DEBT CLEANUP" -ForegroundColor Red
Write-Host "=========================" -ForegroundColor Red

$sourceFiles = Get-ChildItem -Path "src" -Include "*.js", "*.jsx", "*.html", "*.css" -Recurse
$debtPatterns = @('TODO', 'FIXME', 'HACK', 'XXX', 'BUG', 'BROKEN', 'TEMPORARY', 'PLACEHOLDER')
$foundDebt = @()

Write-Host "🔍 Scanning for technical debt..." -ForegroundColor Yellow

foreach ($file in $sourceFiles) {
    $content = Get-Content -Path $file.FullName
    $lineNumber = 0
    
    foreach ($line in $content) {
        $lineNumber++
        foreach ($pattern in $debtPatterns) {
            if ($line -match $pattern) {
                $foundDebt += [PSCustomObject]@{
                    File = $file.Name
                    Line = $lineNumber
                    Pattern = $pattern
                    Content = $line.Trim()
                    FullPath = $file.FullName
                }
            }
        }
    }
}

Write-Host ""
Write-Host "📋 TECHNICAL DEBT REPORT" -ForegroundColor Cyan

if ($foundDebt.Count -eq 0) {
    Write-Host "✅ No technical debt found!" -ForegroundColor Green
} else {
    Write-Host "❌ Found $($foundDebt.Count) instances of technical debt:" -ForegroundColor Red
    
    $groupedDebt = $foundDebt | Group-Object -Property Pattern
    
    foreach ($group in $groupedDebt) {
        Write-Host "$($group.Name): $($group.Count) instances" -ForegroundColor Yellow
    }
    
    $reportPath = "technical-debt-report.csv"
    $foundDebt | Export-Csv -Path $reportPath -NoTypeInformation
    Write-Host "📊 Report exported to: $reportPath" -ForegroundColor Green
}

Write-Host "🏁 Scan complete!" -ForegroundColor Green
