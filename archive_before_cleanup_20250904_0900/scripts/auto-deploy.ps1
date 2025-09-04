# Auto-Deploy Watcher - LetterBlack GenAI Extension
# This script watches for file changes and automatically deploys

Write-Host "👁️ Auto-Deploy Watcher Started" -ForegroundColor Green
Write-Host "Watching for changes in src/ directory..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

# Create file watcher
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = "src\"
$watcher.Filter = "*.*"
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

# Action to perform when file changes
$action = {
    $path = $Event.SourceEventArgs.FullPath
    $changeType = $Event.SourceEventArgs.ChangeType
    $fileName = Split-Path $path -Leaf
    
    # Ignore temporary files and certain extensions
    if ($fileName -match '\.(tmp|swp|~)$' -or $fileName -match '^\.') {
        return
    }
    
    Write-Host "`n📝 File changed: $fileName" -ForegroundColor Yellow
    
    # Debounce - wait a bit to avoid multiple rapid deployments
    Start-Sleep -Seconds 2
    
    try {
        # Quick deploy
        Write-Host "🚀 Auto-deploying..." -ForegroundColor Cyan
        npm run build | Out-Null
        Copy-Item -Path "build\*" -Destination "com.letterblack.genai_Build\" -Recurse -Force
        
        # Update timestamp
        $timestamp = Get-Date -Format "h:mm:ss tt"
        $indexPath = "com.letterblack.genai_Build\index.html"
        if (Test-Path $indexPath) {
            $content = Get-Content $indexPath -Raw
            $content = $content -replace 'UPDATED.*?</span>', "UPDATED $timestamp</span>"
            Set-Content $indexPath -Value $content -Encoding UTF8
        }
        
        # Force CEP refresh
        Stop-Process -Name "CEPHtmlEngine" -Force -ErrorAction SilentlyContinue
        
        Write-Host "✅ Auto-deploy completed at $timestamp" -ForegroundColor Green
        Write-Host "💡 Refresh extension panel to see changes" -ForegroundColor Cyan
        
    } catch {
        Write-Host "❌ Auto-deploy failed: $_" -ForegroundColor Red
    }
}

# Register event handlers
Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action $action
Register-ObjectEvent -InputObject $watcher -EventName "Created" -Action $action
Register-ObjectEvent -InputObject $watcher -EventName "Deleted" -Action $action

try {
    # Keep the script running
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    # Cleanup
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Write-Host "`nAuto-deploy watcher stopped" -ForegroundColor Yellow
}
