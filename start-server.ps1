Write-Host "Navigating to the correct project directory..." -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\project"
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

if (Test-Path "package.json") {
    Write-Host "Package.json found! Starting development server..." -ForegroundColor Green
    Write-Host ""
    npm run dev
} else {
    Write-Host "ERROR: package.json not found in current directory" -ForegroundColor Red
    Write-Host "Please make sure you're in the correct project directory" -ForegroundColor Red
    Read-Host "Press Enter to continue"
} 