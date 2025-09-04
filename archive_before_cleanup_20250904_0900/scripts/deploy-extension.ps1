# LetterBlack GenAI - Reliable CEP Extension Deployment Script
# This script ensures the extension deploys and runs correctly every time

param(
    [switch]$Force = $false,
    [switch]$Verbose = $false
)

Write-Host "🚀 LetterBlack GenAI - CEP Extension Deployment" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Step 1: Build the project
Write-Host "📦 Building project..." -ForegroundColor Yellow
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }
    Write-Host "✅ Build completed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Stop CEP processes to prevent caching issues
Write-Host "🛑 Stopping CEP processes..." -ForegroundColor Yellow
Stop-Process -Name "CEPHtmlEngine" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ CEP processes stopped" -ForegroundColor Green

# Step 3: Enable CEP debugging
Write-Host "🔧 Enabling CEP debugging..." -ForegroundColor Yellow
try {
    reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f | Out-Null
    reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.10" /v PlayerDebugMode /t REG_SZ /d 1 /f | Out-Null
    reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.9" /v PlayerDebugMode /t REG_SZ /d 1 /f | Out-Null
    Write-Host "✅ CEP debugging enabled" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Warning: Could not enable CEP debugging" -ForegroundColor Yellow
}

# Step 4: Copy files to extension directory
Write-Host "📁 Copying files to CEP extension directory..." -ForegroundColor Yellow
try {
    # Ensure the target directory exists
    if (!(Test-Path "com.letterblack.genai_Build")) {
        New-Item -ItemType Directory -Path "com.letterblack.genai_Build" -Force | Out-Null
    }
    
    # Copy all built files
    Copy-Item -Path "build\*" -Destination "com.letterblack.genai_Build\" -Recurse -Force
    
    # Ensure CSXS manifest exists
    if (!(Test-Path "com.letterblack.genai_Build\CSXS")) {
        Copy-Item -Path "config\CSXS" -Destination "com.letterblack.genai_Build\" -Recurse -Force
    }
    
    Write-Host "✅ Files copied successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ File copy failed: $_" -ForegroundColor Red
    exit 1
}

# Step 5: Add deployment timestamp
Write-Host "🕒 Adding deployment timestamp..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "MMM d, yyyy h:mm tt"
$indexPath = "com.letterblack.genai_Build\index.html"

if (Test-Path $indexPath) {
    $content = Get-Content $indexPath -Raw
    
    # Update title with timestamp
    $content = $content -replace '<title>.*?</title>', "<title>LetterBlack GenAI - After Effects AI Assistant [UPDATED: $timestamp]</title>"
    
    # Update header indicator
    $content = $content -replace 'UPDATED.*?</span>', "UPDATED $timestamp</span>"
    
    # Update console log
    $content = $content -replace '🚀 EXTENSION UPDATED.*?Mascot Typing Indicator Active!', "🚀 EXTENSION UPDATED - $timestamp - Mascot Typing Indicator Active!"
    
    Set-Content $indexPath -Value $content -Encoding UTF8
    Write-Host "✅ Timestamp added: $timestamp" -ForegroundColor Green
}

# Step 6: Check After Effects status
Write-Host "🎬 Checking After Effects status..." -ForegroundColor Yellow
$aeProcess = Get-Process -Name "AfterFX" -ErrorAction SilentlyContinue
if ($aeProcess) {
    Write-Host "✅ After Effects is running (PID: $($aeProcess.Id))" -ForegroundColor Green
    
    if ($Force) {
        Write-Host "🔄 Force restart requested - restarting After Effects..." -ForegroundColor Yellow
        Stop-Process -Name "AfterFX" -Force
        Start-Sleep -Seconds 5
        Start-Process -FilePath "C:\Program Files\Adobe\Adobe After Effects 2025\Support Files\AfterFX.exe"
        Write-Host "✅ After Effects restarted" -ForegroundColor Green
    } else {
        Write-Host "💡 Tip: Use -Force to restart After Effects automatically" -ForegroundColor Cyan
    }
} else {
    Write-Host "⚠️ After Effects is not running - starting it..." -ForegroundColor Yellow
    Start-Process -FilePath "C:\Program Files\Adobe\Adobe After Effects 2025\Support Files\AfterFX.exe"
    Write-Host "✅ After Effects started" -ForegroundColor Green
}

# Step 7: Final verification
Write-Host "🔍 Final verification..." -ForegroundColor Yellow

# Check if required files exist
$requiredFiles = @(
    "com.letterblack.genai_Build\index.html",
    "com.letterblack.genai_Build\js\ai\chat-demo.js",
    "com.letterblack.genai_Build\js\core\main.js",
    "com.letterblack.genai_Build\CSXS\manifest.xml"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (MISSING)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if ($allFilesExist) {
    Write-Host "`n🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Open After Effects" -ForegroundColor White
    Write-Host "2. Go to Window > Extensions > LetterBlack Gen AI" -ForegroundColor White
    Write-Host "3. Look for the green 'UPDATED $timestamp' badge" -ForegroundColor White
    Write-Host "4. Test the mascot typing indicator by sending a chat message" -ForegroundColor White
    Write-Host "5. Press F12 in the extension to open DevTools for debugging" -ForegroundColor White
} else {
    Write-Host "`n❌ DEPLOYMENT FAILED - Missing required files" -ForegroundColor Red
    exit 1
}
