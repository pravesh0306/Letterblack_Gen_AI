#!/usr/bin/env pwsh
# Clean Build Folder - Keep Only Essential Extension Files
# Removes test files, demos, and unnecessary assets

Write-Host "🧹 Cleaning Build Folder for Production Extension" -ForegroundColor Cyan
Write-Host "=" * 50

$buildPath = ".\com.letterblack.genai_Build"

if (-not (Test-Path $buildPath)) {
    Write-Host "❌ Build folder not found: $buildPath" -ForegroundColor Red
    exit 1
}

# Files and folders to KEEP (essential for extension)
$keepFiles = @(
    "index.html",
    "host-script.jsx",
    "CSInterface-real.js"
)

$keepFolders = @(
    "CSXS",
    "css",
    "js",
    "assets"
)

# Files and folders to REMOVE (test/demo/development files)
$removeFiles = @(
    ".hintrc",
    "AE_TEST_PLAN.md",
    "CHAT_INTEGRATION_GUIDE.md",
    "chat-demo.html",
    "IMPLEMENTATION_BRIEF.md",
    "index-clean.html",
    "install-extension.bat",
    "READY_FOR_TESTING.md",
    "standalone-test.html",
    "sw.js",
    "test-generation.js",
    "test-working-codeblocks.html",
    "test-wrapper.js"
)

$removeFolders = @(
    "storage"  # Remove if not needed for main extension
)

# Clean up demo/test files
Write-Host "🗑️  Removing test and demo files..." -ForegroundColor Yellow

foreach ($file in $removeFiles) {
    $filePath = Join-Path $buildPath $file
    if (Test-Path $filePath) {
        Remove-Item $filePath -Force
        Write-Host "   ✓ Removed: $file" -ForegroundColor Green
    }
}

foreach ($folder in $removeFolders) {
    $folderPath = Join-Path $buildPath $folder
    if (Test-Path $folderPath) {
        Remove-Item $folderPath -Recurse -Force
        Write-Host "   ✓ Removed folder: $folder" -ForegroundColor Green
    }
}

# Clean up backup folders in CSS
$cssBackupPath = Join-Path $buildPath "css\backup"
if (Test-Path $cssBackupPath) {
    Remove-Item $cssBackupPath -Recurse -Force
    Write-Host "   ✓ Removed: css\backup" -ForegroundColor Green
}

# Clean up test and demo JS files
$jsPath = Join-Path $buildPath "js"
if (Test-Path $jsPath) {
    Write-Host "🧹 Cleaning JS folder..." -ForegroundColor Yellow
    
    # Remove test files
    $testFiles = Get-ChildItem $jsPath -Recurse -File | Where-Object { 
        $_.Name -like "*test*" -or 
        $_.Name -like "*demo*" -or
        $_.Name -like "*example*" -or
        $_.Name -like "*sample*"
    }
    
    foreach ($file in $testFiles) {
        Remove-Item $file.FullName -Force
        Write-Host "   ✓ Removed: $($file.Name)" -ForegroundColor Green
    }
}

# Clean up test assets
$assetsPath = Join-Path $buildPath "assets"
if (Test-Path $assetsPath) {
    Write-Host "🧹 Cleaning Assets folder..." -ForegroundColor Yellow
    
    # Keep only essential assets, remove demo videos
    $demoAssets = Get-ChildItem $assetsPath -File | Where-Object { 
        $_.Extension -eq ".webm" -or
        $_.Name -like "*demo*" -or
        $_.Name -like "*test*"
    }
    
    foreach ($asset in $demoAssets) {
        Remove-Item $asset.FullName -Force
        Write-Host "   ✓ Removed: $($asset.Name)" -ForegroundColor Green
    }
}

# Show final structure
Write-Host "`n📁 Final Extension Structure:" -ForegroundColor Cyan
Get-ChildItem $buildPath -Recurse | ForEach-Object {
    $indent = "  " * (($_.FullName.Replace($buildPath, "").Split("\").Count) - 1)
    if ($_.PSIsContainer) {
        Write-Host "$indent📁 $($_.Name)/" -ForegroundColor Blue
    } else {
        Write-Host "$indent📄 $($_.Name)" -ForegroundColor White
    }
}

Write-Host "`n✅ Build folder cleaned successfully!" -ForegroundColor Green
Write-Host "📦 Ready for extension deployment" -ForegroundColor Cyan
