# Git Sync Aliases for Quick Development
# Use these commands to keep workspace synchronized

# Quick sync commands
function gs { git status }
function ga { git add . }
function gc { param($msg) git commit -m $msg }
function gp { git push }
function gl { git pull }
function gsync { git add .; git commit -m "Auto sync workspace"; git push }

# Branch management
function gb { git branch }
function gco { param($branch) git checkout $branch }
function gcb { param($branch) git checkout -b $branch }

# Status checking
function glog { git log --oneline -10 }
function gdiff { git diff }
function gstash { git stash }

Write-Host "🔗 Git aliases loaded! Use 'gsync' for quick workspace synchronization"
Write-Host "📋 Available commands:"
Write-Host "   gs     - git status"
Write-Host "   ga     - git add all"
Write-Host "   gc     - git commit with message"
Write-Host "   gp     - git push"
Write-Host "   gl     - git pull"
Write-Host "   gsync  - add, commit, and push in one command"
