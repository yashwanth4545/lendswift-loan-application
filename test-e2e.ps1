# LendSwift - E2E tests (build + preview + Cypress)
. "$PSScriptRoot\scripts\node-env.ps1"
Initialize-LendSwiftNode

if (-not (Test-Path "node_modules")) {
  Write-Host "Installing dependencies..." -ForegroundColor Cyan
  npm install
}

Write-Host ""
Write-Host "Ensuring Cypress browser binary is installed (first run may download ~200MB)..." -ForegroundColor Cyan
npx cypress install

if ($LASTEXITCODE -ne 0) {
  Write-Host "Cypress install failed. Try manually: npx cypress install" -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Running E2E test suite (this may take several minutes)..." -ForegroundColor Green
Write-Host ""

npm run test:e2e:ci

exit $LASTEXITCODE
