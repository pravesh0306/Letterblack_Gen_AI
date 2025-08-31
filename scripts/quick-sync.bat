@echo off
echo 🔄 Quick Git Sync Starting...
echo.

echo 📊 Current Status:
git status --short

echo.
echo 📦 Adding all changes...
git add .

echo.
echo 💾 Committing changes...
if "%1"=="" (
    git commit -m "Auto sync workspace - %date% %time%"
) else (
    git commit -m "%*"
)

echo.
echo 🚀 Pushing to remote...
git push

echo.
echo ✅ Workspace synchronized with GitHub!
echo 🌐 Repository: https://github.com/pravesh0306/Letterblack_Gen_AI.git
pause
