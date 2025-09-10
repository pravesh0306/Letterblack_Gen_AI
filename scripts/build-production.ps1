#!/usr/bin/env pwsh
# Production Build Optimization Script

Write-Host "🚀 PRODUCTION BUILD OPTIMIZATION" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Step 1: Clean build directory
Write-Host "🧹 Cleaning build directory..." -ForegroundColor Yellow
if (Test-Path "com.letterblack.genai_Build") {
    Remove-Item -Recurse -Force "com.letterblack.genai_Build"
}

# Step 2: Copy source to build
Write-Host "📁 Copying source files..." -ForegroundColor Yellow
xcopy "src" "com.letterblack.genai_Build\" /E /I /Y

# Step 3: Remove development files from build
Write-Host "🗑️ Removing development files..." -ForegroundColor Yellow
$devFiles = @(
    "com.letterblack.genai_Build\**\*.test.js",
    "com.letterblack.genai_Build\**\*.spec.js",
    "com.letterblack.genai_Build\**\debug.js",
    "com.letterblack.genai_Build\**\*.map"
)

foreach ($pattern in $devFiles) {
    Get-ChildItem -Path $pattern -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force
}

# Step 4: Optimize JavaScript files
Write-Host "⚡ Optimizing JavaScript..." -ForegroundColor Yellow
$jsFiles = Get-ChildItem -Path "com.letterblack.genai_Build" -Include "*.js" -Recurse

foreach ($file in $jsFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Remove debug console logs (keep only warn/error in production)
    $content = $content -replace 'this\.logger\.debug\([^)]*\);?\s*', ''
    $content = $content -replace 'this\.logger\.info\([^)]*\);?\s*', ''
    
    # Remove comments (basic cleanup)
    $content = $content -replace '//.*$', '' -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ } | Join-String -Separator "`n"
    
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

# Step 5: Optimize CSS files
Write-Host "🎨 Optimizing CSS..." -ForegroundColor Yellow
$cssFiles = Get-ChildItem -Path "com.letterblack.genai_Build" -Include "*.css" -Recurse

foreach ($file in $cssFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Remove comments and extra whitespace
    $content = $content -replace '/\*.*?\*/', '' -replace '\s+', ' ' -replace ';\s*}', '}' -replace '{\s*', '{' -replace '}\s*', '}'
    
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

# Step 6: Update manifest for production
Write-Host "📋 Updating manifest for production..." -ForegroundColor Yellow
$manifestPath = "com.letterblack.genai_Build\CSXS\manifest.xml"
if (Test-Path $manifestPath) {
    $manifest = Get-Content -Path $manifestPath -Raw
    # Update version and remove debug flags
    $manifest = $manifest -replace '<\!--.*?-->', ''
    Set-Content -Path $manifestPath -Value $manifest -NoNewline
}

# Step 7: Generate build report
Write-Host "📊 Generating build report..." -ForegroundColor Yellow
$sourceSize = (Get-ChildItem -Path "src" -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
$buildSize = (Get-ChildItem -Path "com.letterblack.genai_Build" -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
$savings = [math]::Round((($sourceSize - $buildSize) / $sourceSize) * 100, 2)

Write-Host ""
Write-Host "✅ BUILD COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "📊 Source size: $([math]::Round($sourceSize, 2)) MB" -ForegroundColor White
Write-Host "📦 Build size: $([math]::Round($buildSize, 2)) MB" -ForegroundColor White
Write-Host "💾 Space saved: $savings%" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Production build ready at: com.letterblack.genai_Build/" -ForegroundColor Green
