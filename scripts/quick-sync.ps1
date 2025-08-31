# PowerShell Quick Git Sync
param(
    [string]$message = "Auto sync workspace - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

Write-Host "🔄 Quick Git Sync Starting..." -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 Current Status:" -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "📦 Adding all changes..." -ForegroundColor Green
git add .

Write-Host ""
Write-Host "💾 Committing changes..." -ForegroundColor Blue
git commit -m $message

Write-Host ""
Write-Host "🚀 Pushing to remote..." -ForegroundColor Magenta
git push

Write-Host ""
Write-Host "✅ Workspace synchronized with GitHub!" -ForegroundColor Green
Write-Host "🌐 Repository: https://github.com/pravesh0306/Letterblack_Gen_AI.git" -ForegroundColor Cyan
