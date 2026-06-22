# LendSwift - shared portable Node.js PATH (no global install required)
$script:ProjectRoot = Split-Path $PSScriptRoot -Parent
$script:NodeDir = Join-Path $script:ProjectRoot "..\.tools\node" | ForEach-Object {
  [System.IO.Path]::GetFullPath($_)
}

function Initialize-LendSwiftNode {
  if (-not (Test-Path (Join-Path $script:NodeDir "node.exe"))) {
    Write-Host ""
    Write-Host "Node.js not found at: $($script:NodeDir)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Option 1 - Install Node.js LTS from https://nodejs.org (check Add to PATH)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 2 - Run setup first (downloads portable Node):" -ForegroundColor Yellow
    Write-Host "  powershell -ExecutionPolicy Bypass -File .\setup.ps1"
    Write-Host ""
    exit 1
  }

  $env:PATH = "$($script:NodeDir);$env:PATH"
  Set-Location $script:ProjectRoot
}
