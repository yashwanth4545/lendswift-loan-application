# LendSwift - start dev server (no global Node.js required)
. "$PSScriptRoot\scripts\node-env.ps1"
Initialize-LendSwiftNode

if (-not (Test-Path "node_modules")) {
  Write-Host "Installing dependencies..." -ForegroundColor Cyan
  npm install
}

Write-Host ""
Write-Host "Starting LendSwift dev server..." -ForegroundColor Green
Write-Host "Open: http://localhost:5173/" -ForegroundColor Cyan
Write-Host ""

npm run dev
