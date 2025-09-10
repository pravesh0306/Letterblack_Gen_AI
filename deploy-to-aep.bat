@echo off
echo Deploying LetterBlack Gen AI Extension to Adobe After Effects...

REM Build the extension
call npm run build

REM Set extension path
set EXTENSION_PATH=%APPDATA%\Adobe\CEP\extensions\com.letterblack.genai

REM Create extension directory
if not exist "%EXTENSION_PATH%" mkdir "%EXTENSION_PATH%"
if not exist "%EXTENSION_PATH%\CSXS" mkdir "%EXTENSION_PATH%\CSXS"

REM Copy files
xcopy build\* "%EXTENSION_PATH%\" /E /I /Y
copy config\CSXS\manifest.xml "%EXTENSION_PATH%\CSXS\manifest.xml" /Y

REM Enable CEP debug mode
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.12" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1

echo.
echo ✅ Extension deployed successfully!
echo 📂 Location: %EXTENSION_PATH%
echo.
echo 🚀 To use the extension:
echo    1. Close Adobe After Effects if it's running
echo    2. Launch Adobe After Effects
echo    3. Go to Window ^> Extensions ^> LetterBlack_Gen_AI v2.0.2
echo.
echo 🔧 Troubleshooting:
echo    - If extension doesn't appear, restart After Effects
echo    - Check Window ^> Extensions menu
echo    - Ensure After Effects version is 22.0 or higher
echo.
pause
