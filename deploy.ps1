# LendSwift - build and deploy to Netlify
. "$PSScriptRoot\scripts\node-env.ps1"
Initialize-LendSwiftNode

$siteName = "lendswift-loan-application"

Write-Host ""
Write-Host "Checking Netlify login..." -ForegroundColor Cyan
$statusOut = npx netlify status 2>&1 | Out-String

if ($statusOut -match "Not logged in") {
  Write-Host ""
  Write-Host "Not logged in to Netlify." -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Option A - Log in (recommended, permanent site):" -ForegroundColor White
  Write-Host "  npx netlify login"
  Write-Host "  powershell -ExecutionPolicy Bypass -File .\deploy.ps1"
  Write-Host ""
  Write-Host "Option B - Anonymous deploy (claimable draft URL, no login):" -ForegroundColor White
  Write-Host "  npx netlify deploy --prod --dir=dist --no-build --site-name $siteName --allow-anonymous"
  Write-Host ""
  exit 1
}

Write-Host ""
Write-Host "Building LendSwift..." -ForegroundColor Green
& "$PSScriptRoot\build.ps1"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Deploying to Netlify (production)..." -ForegroundColor Green

$linked = Test-Path ".netlify\state.json"
if (-not $linked) {
  Write-Host "No linked site — creating '$siteName' on first deploy..." -ForegroundColor Cyan
  npx netlify deploy --prod --dir=dist --no-build --site-name $siteName
} else {
  npx netlify deploy --prod --dir=dist --no-build
}

if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Deploy complete. Run 'npx netlify open:site' to view the live URL." -ForegroundColor Green
Write-Host ""
