# ZeTheta portal submission package — run this before uploading
$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path $PSScriptRoot -Parent
$OutDir = Split-Path $ProjectRoot -Parent
$OutZip = Join-Path $OutDir "ZETHETA-SUBMIT-lendswift-loan-application.zip"
$Staging = Join-Path $env:TEMP "lendswift-submission-staging"

Write-Host ""
Write-Host "Preparing ZeTheta submission package..." -ForegroundColor Cyan

if (Test-Path $Staging) { Remove-Item -Recurse -Force $Staging }
if (Test-Path $OutZip) { Remove-Item -Force $OutZip }
New-Item -ItemType Directory -Path $Staging | Out-Null

$excludeFiles = @('tsconfig.tsbuildinfo')

Get-ChildItem -Path $ProjectRoot -Force | ForEach-Object {
  if ($_.Name -in @('node_modules', 'dist', '.netlify', '.git')) { return }
  if ($_.PSIsContainer) {
    if ($_.Name -eq 'cypress') {
      robocopy (Join-Path $ProjectRoot 'cypress') (Join-Path $Staging 'cypress') /E /XD videos screenshots /NFL /NDL /NJH /NJS | Out-Null
    } else {
      robocopy $_.FullName (Join-Path $Staging $_.Name) /E /XD node_modules dist .netlify .git /NFL /NDL /NJH /NJS | Out-Null
    }
  } else {
    if ($_.Name -notin $excludeFiles) {
      Copy-Item $_.FullName (Join-Path $Staging $_.Name)
    }
  }
}

Compress-Archive -Path (Join-Path $Staging '*') -DestinationPath $OutZip -Force
Remove-Item -Recurse -Force $Staging

$mb = [math]::Round((Get-Item $OutZip).Length / 1MB, 2)
Write-Host ""
Write-Host "UPLOAD THIS FILE to ZeTheta portal:" -ForegroundColor Green
Write-Host "  $OutZip" -ForegroundColor White
Write-Host "  Size: $mb MB" -ForegroundColor Gray
Write-Host ""
Write-Host "Optional: Add More -> demo/lendswift-demo.mp4 (already inside zip at demo/)" -ForegroundColor Yellow
Write-Host ""
