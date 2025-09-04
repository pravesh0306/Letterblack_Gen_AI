# Quick Deploy - LetterBlack GenAI Extension
# Use this for quick deployments during development

Write-Host "⚡ Quick Deploy - LetterBlack GenAI" -ForegroundColor Yellow

# Build and copy
npm run build
Copy-Item -Path "build\*" -Destination "com.letterblack.genai_Build\" -Recurse -Force

# Add timestamp
$timestamp = Get-Date -Format "h:mm tt"
$indexPath = "com.letterblack.genai_Build\index.html"
if (Test-Path $indexPath) {
    $content = Get-Content $indexPath -Raw
    $content = $content -replace 'UPDATED.*?</span>', "UPDATED $timestamp</span>"
    Set-Content $indexPath -Value $content -Encoding UTF8
}

# Stop CEP to force refresh
Stop-Process -Name "CEPHtmlEngine" -Force -ErrorAction SilentlyContinue

Write-Host "✅ Quick deploy completed - Timestamp: $timestamp" -ForegroundColor Green
Write-Host "💡 Refresh the extension panel or restart After Effects to see changes" -ForegroundColor Cyan
