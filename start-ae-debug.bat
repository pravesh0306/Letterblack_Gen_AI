@echo off
echo 🚀 Starting After Effects with Debug Configuration...
echo.

REM Kill any existing After Effects processes
taskkill /f /im "AfterFX.exe" >nul 2>&1

REM Wait a moment
timeout /t 2 >nul

REM Set CEP debug environment variables
set CEP_DEBUG_MODE=1
set ENABLE_NODEJS_DEBUGGING=1

REM Find and launch After Effects
set AE_PATH=""
if exist "%ProgramFiles%\Adobe\Adobe After Effects 2025\Support Files\AfterFX.exe" (
    set AE_PATH="%ProgramFiles%\Adobe\Adobe After Effects 2025\Support Files\AfterFX.exe"
) else if exist "%ProgramFiles%\Adobe\Adobe After Effects 2024\Support Files\AfterFX.exe" (
    set AE_PATH="%ProgramFiles%\Adobe\Adobe After Effects 2024\Support Files\AfterFX.exe"
) else if exist "%ProgramFiles%\Adobe\Adobe After Effects 2023\Support Files\AfterFX.exe" (
    set AE_PATH="%ProgramFiles%\Adobe\Adobe After Effects 2023\Support Files\AfterFX.exe"
)

if %AE_PATH%=="" (
    echo ❌ After Effects not found in standard locations
    echo Please start After Effects manually
    pause
    exit /b 1
)

echo ✅ Found After Effects: %AE_PATH%
echo 🔄 Starting with CEP debug mode enabled...
echo.

start "" %AE_PATH%

echo 🎯 Instructions:
echo 1. Wait for After Effects to fully load
echo 2. Go to Window ^> Extensions
echo 3. Look for "LetterBlack_Gen_AI v2.0.2"
echo 4. If you see a GREEN BORDER around the extension, debug mode is active!
echo.
pause
