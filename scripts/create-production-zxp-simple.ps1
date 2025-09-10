$buildDir = "com.letterblack.genai_Build"
$packageName = "letterblack-gen-ai-v$(Get-Date -Format 'yyyy.MM.dd')"
$outputFile = "$packageName.zxp"

Write-Host "Creating production ZXP package..." -ForegroundColor Cyan

if (!(Test-Path $buildDir)) {
    Write-Host "Build directory not found. Run npm run build first." -ForegroundColor Red
    exit 1
}

$buildSize = (Get-ChildItem $buildDir -Recurse | Measure-Object -Property Length -Sum).Sum
$buildSizeMB = [math]::Round($buildSize / 1MB, 2)
Write-Host "Build size: $buildSizeMB MB" -ForegroundColor Yellow

try {
    Compress-Archive -Path "$buildDir\*" -DestinationPath "$packageName.zip" -Force
    
    if (Test-Path "$packageName.zip") {
        Rename-Item "$packageName.zip" $outputFile -Force
    }
    
    $packageSize = (Get-Item $outputFile).Length
    $packageSizeMB = [math]::Round($packageSize / 1MB, 2)
    
    Write-Host ""
    Write-Host "SUCCESS: ZXP package created!" -ForegroundColor Green
    Write-Host "File: $outputFile" -ForegroundColor White
    Write-Host "Size: $packageSizeMB MB" -ForegroundColor White
    
    if ($buildSize -gt 0) {
        $compressionRatio = [math]::Round((1 - $packageSize/$buildSize) * 100, 1)
        Write-Host "Compression: $compressionRatio% reduction" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Install with Adobe Extension Manager or ZXPInstaller" -ForegroundColor Cyan
    
} catch {
    Write-Host "Error creating ZXP: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Production packaging complete!" -ForegroundColor Green
