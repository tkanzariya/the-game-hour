# Log in to GitHub for Git push/pull (HTTPS).
# Run from PowerShell:  .\scripts\git-login.ps1
#
# Opens a browser to authenticate as the GitHub account that owns the repo
# (use tkanzariya for https://github.com/tkanzariya/the-game-hour).

$ErrorActionPreference = 'Stop'

$gh = Get-Command gh -ErrorAction SilentlyContinue
if (-not $gh) {
    $ghPath = 'C:\Program Files\GitHub CLI\gh.exe'
    if (Test-Path $ghPath) {
        $env:PATH = "C:\Program Files\GitHub CLI;$env:PATH"
    } else {
        Write-Host 'GitHub CLI (gh) not found. Install with: winget install GitHub.cli'
        exit 1
    }
}

Write-Host ''
Write-Host '=== GitHub login for Git ===' -ForegroundColor Cyan
Write-Host 'A browser window will open. Sign in as tkanzariya (repo owner).' -ForegroundColor Yellow
Write-Host ''

# Clear stale GitHub credentials from Windows Credential Manager (optional but helps)
cmdkey /list 2>$null | Select-String 'git:https://github.com' | ForEach-Object {
    Write-Host 'Removing stale credential entry...'
    cmdkey /delete:LegacyGeneric:target=git:https://github.com 2>$null
}

gh auth login --hostname github.com --git-protocol https --web

Write-Host ''
Write-Host '=== Verifying ===' -ForegroundColor Cyan
gh auth status
Write-Host ''
Write-Host 'Git is now configured to use your GitHub login for HTTPS.' -ForegroundColor Green
Write-Host 'Push with:  git push -u origin main' -ForegroundColor Green
Write-Host ''
