# LetterBlack Gen AI - Diagnostic Check Script
# This script validates the extension's processing pipeline

Write-Host "🔍 LetterBlack Gen AI Diagnostic Check" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

$extensionPath = "$env:APPDATA\Adobe\CEP\extensions\com.letterblack.genai_Build"
$buildPath = ".\build"

# Check if extension is deployed
Write-Host "`n📦 Extension Deployment Check:" -ForegroundColor Yellow
if (Test-Path $extensionPath) {
    Write-Host "   ✅ Extension deployed at: $extensionPath" -ForegroundColor Green
    
    # Check key files
    $keyFiles = @(
        "index.html",
        "js\core\main.js",
        "js\ai\ai-module.js",
        "css\main-styles.css",
        "CSXS\manifest.xml"
    )
    
    foreach ($file in $keyFiles) {
        $fullPath = Join-Path $extensionPath $file
        if (Test-Path $fullPath) {
            $size = (Get-Item $fullPath).Length
            Write-Host "   ✅ $file ($size bytes)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Missing: $file" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ❌ Extension not deployed" -ForegroundColor Red
    Write-Host "   💡 Run: .\scripts\deploy-extension.ps1" -ForegroundColor Yellow
}

# Check AI Module Functions
Write-Host "`n🤖 AI Module Function Check:" -ForegroundColor Yellow
$aiModulePath = Join-Path $extensionPath "js\ai\ai-module.js"
if (Test-Path $aiModulePath) {
    $content = Get-Content $aiModulePath -Raw
    
    $functions = @(
        "formatResponseForChat",
        "createProfessionalCodeBlock",
        "detectCodeType",
        "escapeHtml"
    )
    
    foreach ($func in $functions) {
        if ($content -match "function $func|$func\s*[:=]\s*function|$func\s*=\s*\(") {
            Write-Host "   ✅ Function found: $func" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Missing function: $func" -ForegroundColor Red
        }
    }
    
    # Check for professional code block CSS classes
    if ($content -match "code-block-container") {
        Write-Host "   ✅ Professional code block HTML generation found" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Professional code block HTML generation missing" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ AI Module file not found" -ForegroundColor Red
}

# Check CSS Styles
Write-Host "`n🎨 CSS Style Check:" -ForegroundColor Yellow
$cssPath = Join-Path $extensionPath "css\main-styles.css"
$enhancedCssPath = Join-Path $extensionPath "css\components\enhanced-code-blocks.css"
$cssContent = ""

if (Test-Path $cssPath) {
    $cssContent += Get-Content $cssPath -Raw
}
if (Test-Path $enhancedCssPath) {
    $cssContent += Get-Content $enhancedCssPath -Raw
    Write-Host "   ✅ Enhanced code blocks CSS file found" -ForegroundColor Green
}
    
if ($cssContent) {
    $cssClasses = @(
        "code-block-container",
        "code-header",
        "copy-btn",
        "apply-btn"
    )
    
    foreach ($class in $cssClasses) {
        if ($cssContent -match "\.$class\s*\{") {
            Write-Host "   ✅ CSS class found: .$class" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Missing CSS class: .$class" -ForegroundColor Red
        }
    }
    
    # Check for blue gradient
    if ($cssContent -match "linear-gradient.*blue|background.*#[0-9a-fA-F]{3,6}.*blue") {
        Write-Host "   ✅ Blue gradient styling found" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Blue gradient styling may be missing" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ CSS files not found" -ForegroundColor Red
}

# Check Main.js Integration
Write-Host "`n🔧 Main.js Integration Check:" -ForegroundColor Yellow
$mainJsPath = Join-Path $extensionPath "js\core\main.js"
if (Test-Path $mainJsPath) {
    $mainContent = Get-Content $mainJsPath -Raw
    
    $integrations = @(
        "testProfessionalCodeBlocks",
        "handleSendMessage",
        "formatResponseForChat",
        "addMessageToChat"
    )
    
    foreach ($integration in $integrations) {
        if ($mainContent -match $integration) {
            Write-Host "   ✅ Integration found: $integration" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Missing integration: $integration" -ForegroundColor Red
        }
    }
    
    # Check for enhanced debugging
    if ($mainContent -match "AI Module state|Enhanced debugging|activeAIModule") {
        Write-Host "   ✅ Enhanced debugging found" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Enhanced debugging may be missing" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Main.js file not found" -ForegroundColor Red
}

# Build vs Deploy Sync Check
Write-Host "`n🔄 Build vs Deploy Sync Check:" -ForegroundColor Yellow
if ((Test-Path $buildPath) -and (Test-Path $extensionPath)) {
    $buildMain = Join-Path $buildPath "js\core\main.js"
    $deployMain = Join-Path $extensionPath "js\core\main.js"
    
    if ((Test-Path $buildMain) -and (Test-Path $deployMain)) {
        $buildSize = (Get-Item $buildMain).Length
        $deploySize = (Get-Item $deployMain).Length
        $buildTime = (Get-Item $buildMain).LastWriteTime
        $deployTime = (Get-Item $deployMain).LastWriteTime
        
        Write-Host "   📁 Build main.js: $buildSize bytes, modified $buildTime" -ForegroundColor Cyan
        Write-Host "   🚀 Deploy main.js: $deploySize bytes, modified $deployTime" -ForegroundColor Cyan
        
        if ($buildSize -eq $deploySize -and $buildTime -le $deployTime.AddMinutes(1)) {
            Write-Host "   ✅ Files appear synchronized" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Files may be out of sync - consider redeploying" -ForegroundColor Yellow
        }
    }
}

# Summary and Recommendations
Write-Host "`n📋 Summary & Next Steps:" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "1. If all checks pass ✅, try the test function in browser console:" -ForegroundColor White
Write-Host "   testProfessionalCodeBlocks()" -ForegroundColor Gray
Write-Host "`n2. If issues found ❌, run deployment again:" -ForegroundColor White
Write-Host "   .\scripts\deploy-extension.ps1" -ForegroundColor Gray
Write-Host "`n3. For live debugging, check browser console in extension panel (F12)" -ForegroundColor White
Write-Host "`n4. Test with AI chat: Ask for 'wiggle expression' and look for blue headers" -ForegroundColor White

Write-Host "`n🎯 Diagnostic check complete!" -ForegroundColor Green
