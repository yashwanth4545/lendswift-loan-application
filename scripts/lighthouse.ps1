# Run Lighthouse against the deployed LendSwift URL (requires Google Chrome installed)
. "$PSScriptRoot\node-env.ps1"
Initialize-LendSwiftNode

$url = if ($args[0]) { $args[0] } else { "https://lendswift-loan-application.netlify.app" }
$out = Join-Path (Split-Path $PSScriptRoot -Parent) "lighthouse-report.html"

Write-Host ""
Write-Host "Running Lighthouse on $url ..." -ForegroundColor Cyan
Write-Host "Requires Chrome/Chromium on PATH." -ForegroundColor Yellow
Write-Host ""

npx lighthouse $url `
  --only-categories=accessibility,performance,best-practices,seo `
  --output=html `
  --output=json `
  --output-path=$out `
  --view

if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "If Chrome is missing, run Lighthouse manually:" -ForegroundColor Yellow
  Write-Host "  Chrome DevTools -> Lighthouse tab -> Analyze page load"
  Write-Host "  Or: https://pagespeed.web.dev/analysis?url=$url"
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Report saved: $out" -ForegroundColor Green
