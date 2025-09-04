# Direct sync script for CEP extension (no junction)
Write-Host "🔄 Syncing extension files directly..." -ForegroundColor Cyan

$buildPath = ".\com.letterblack.genai_Build\*"
$cepPath = "C:\Users\prave\AppData\Roaming\Adobe\CEP\extensions\com.letterblack.genai\"

try {
    Copy-Item $buildPath $cepPath -Recurse -Force
    Write-Host "✅ Files synced successfully" -ForegroundColor Green
    
    # Restart CEP engine
    Stop-Process -Name "CEPHtmlEngine" -Force -ErrorAction SilentlyContinue
    Start-Sleep 2
    Write-Host "🔄 CEP engine restarted" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Sync failed: $($_.Exception.Message)" -ForegroundColor Red
}
