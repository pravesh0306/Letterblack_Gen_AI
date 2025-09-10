# INDIVIDUAL ORPHANED MODULE ANALYSIS
# LetterBlack GenAI - After Effects Extension
# Date: September 8, 2025

Write-Host "=== INDIVIDUAL ORPHANED MODULE ANALYSIS ===" -ForegroundColor Cyan
Write-Host ""

# Get loaded scripts from HTML
$htmlContent = Get-Content "g:\Developments\15_AI_AE\Adobe_AI_Generations\src\indexBackup.html" -Raw
$loadedPaths = [regex]::Matches($htmlContent, 'src="([^"]+\.js)"') | 
    Where-Object { $_.Groups[1].Value -notmatch "https?://" } | 
    ForEach-Object { $_.Groups[1].Value }

# Get all JS files in src
$allSrcFiles = Get-ChildItem -Path "g:\Developments\15_AI_AE\Adobe_AI_Generations\src" -Recurse -Include "*.js" |
    Where-Object { $_.FullName -notmatch "libs|fontawesome|prism" }

# Find orphaned files
$orphanedFiles = @()
foreach ($file in $allSrcFiles) {
    $relativePath = $file.FullName.Replace("g:\Developments\15_AI_AE\Adobe_AI_Generations\src\", "").Replace("\", "/")
    if ($relativePath -notin $loadedPaths) {
        $orphanedFiles += $file
    }
}

Write-Host "📊 FOUND $($orphanedFiles.Count) ORPHANED MODULES" -ForegroundColor Red
Write-Host ""

# Function to analyze file content
function Get-ModuleAnalysis($filePath) {
    try {
        $content = Get-Content $filePath -Raw -ErrorAction SilentlyContinue
        if (-not $content) {
            return @{
                Status = "EMPTY"
                Size = 0
                Description = "Empty file"
                Recommendation = "DELETE"
            }
        }
        
        $size = [Math]::Round((Get-Item $filePath).Length / 1KB, 1)
        $lines = ($content -split "`n").Count
        
        # Check for deprecation markers
        if ($content -match "deprecated|LEGACY|NO LONGER USED|replaced by") {
            return @{
                Status = "DEPRECATED"
                Size = $size
                Lines = $lines
                Description = "Explicitly marked as deprecated"
                Recommendation = "DELETE"
            }
        }
        
        # Check if it's a class/function definition
        if ($content -match "class\s+\w+|function\s+\w+|window\.\w+\s*=") {
            return @{
                Status = "FUNCTIONAL"
                Size = $size
                Lines = $lines
                Description = "Contains class/function definitions"
                Recommendation = "EVALUATE"
            }
        }
        
        # Check if it's just placeholder/stub
        if ($lines -lt 10 -and $content -match "placeholder|stub|todo|not implemented") {
            return @{
                Status = "STUB"
                Size = $size
                Lines = $lines
                Description = "Placeholder or stub file"
                Recommendation = "DELETE"
            }
        }
        
        # Check if it's configuration/constants
        if ($content -match "const\s+\w+|var\s+\w+|APP_CONSTANTS|CONFIG") {
            return @{
                Status = "CONFIG"
                Size = $size
                Lines = $lines
                Description = "Configuration or constants"
                Recommendation = "KEEP"
            }
        }
        
        return @{
            Status = "UNKNOWN"
            Size = $size
            Lines = $lines
            Description = "Unknown purpose - needs manual review"
            Recommendation = "REVIEW"
        }
        
    } catch {
        return @{
            Status = "ERROR"
            Size = 0
            Description = "Could not read file: $($_.Exception.Message)"
            Recommendation = "REVIEW"
        }
    }
}

# Analyze each orphaned module
$results = @()
$categories = @{
    "DELETE" = @()
    "KEEP" = @()
    "REVIEW" = @()
    "EVALUATE" = @()
}

Write-Host "🔍 ANALYZING EACH ORPHANED MODULE..." -ForegroundColor Yellow
Write-Host ""

foreach ($file in $orphanedFiles) {
    $relativePath = $file.FullName.Replace("g:\Developments\15_AI_AE\Adobe_AI_Generations\src\", "")
    $analysis = Get-ModuleAnalysis $file.FullName
    
    $result = [PSCustomObject]@{
        Path = $relativePath
        Status = $analysis.Status
        Size = $analysis.Size
        Lines = $analysis.Lines
        Description = $analysis.Description
        Recommendation = $analysis.Recommendation
    }
    
    $results += $result
    $categories[$analysis.Recommendation] += $result
    
    # Color coding based on recommendation
    $color = switch ($analysis.Recommendation) {
        "DELETE" { "Red" }
        "KEEP" { "Green" }
        "REVIEW" { "Yellow" }
        "EVALUATE" { "Cyan" }
        default { "White" }
    }
    
    Write-Host "📄 $($relativePath)" -ForegroundColor $color
    Write-Host "   Status: $($analysis.Status) | Size: $($analysis.Size)KB | Rec: $($analysis.Recommendation)" -ForegroundColor Gray
    Write-Host "   $($analysis.Description)" -ForegroundColor DarkGray
    Write-Host ""
}

# Summary by category
Write-Host "=== SUMMARY BY RECOMMENDATION ===" -ForegroundColor Green
Write-Host ""

foreach ($category in $categories.Keys) {
    $count = $categories[$category].Count
    if ($count -gt 0) {
        $color = switch ($category) {
            "DELETE" { "Red" }
            "KEEP" { "Green" }
            "REVIEW" { "Yellow" }
            "EVALUATE" { "Cyan" }
        }
        
        Write-Host "🔹 $category ($count files):" -ForegroundColor $color
        foreach ($item in $categories[$category]) {
            Write-Host "   • $($item.Path)" -ForegroundColor Gray
        }
        Write-Host ""
    }
}

# Overall statistics
$totalSize = ($results | Measure-Object -Property Size -Sum).Sum
Write-Host "=== OVERALL STATISTICS ===" -ForegroundColor Magenta
Write-Host "Total orphaned modules: $($results.Count)" -ForegroundColor White
Write-Host "Total size: $([Math]::Round($totalSize, 1)) KB" -ForegroundColor White
Write-Host "Safe to delete: $($categories['DELETE'].Count) files" -ForegroundColor Red
Write-Host "Recommended to keep: $($categories['KEEP'].Count) files" -ForegroundColor Green
Write-Host "Need review: $($categories['REVIEW'].Count + $categories['EVALUATE'].Count) files" -ForegroundColor Yellow
