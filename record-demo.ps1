# LendSwift - record paced demo video via Cypress (no voiceover; on-screen captions)
. "$PSScriptRoot\scripts\node-env.ps1"
Initialize-LendSwiftNode

if (-not (Test-Path "node_modules")) {
  Write-Host "Installing dependencies..." -ForegroundColor Cyan
  npm install
}

Write-Host ""
Write-Host "Ensuring Cypress browser binary is installed..." -ForegroundColor Cyan
npx cypress install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Recording demo walkthrough (~3-5 min video)..." -ForegroundColor Green
Write-Host ""

node scripts/run-demo-recording.mjs
exit $LASTEXITCODE
