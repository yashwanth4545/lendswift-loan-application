# LendSwift - production build
. "$PSScriptRoot\scripts\node-env.ps1"
Initialize-LendSwiftNode

if (-not (Test-Path "node_modules")) {
  Write-Host "Installing dependencies..." -ForegroundColor Cyan
  npm install
}

Write-Host ""
Write-Host "Building LendSwift..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Build complete - output in .\dist" -ForegroundColor Green
Write-Host ""
