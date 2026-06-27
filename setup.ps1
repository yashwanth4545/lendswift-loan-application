# LendSwift - one-time setup (portable Node + npm install)
$ErrorActionPreference = "Stop"
$ToolsRoot = Join-Path $PSScriptRoot "..\.tools"
$NodeDir = Join-Path $ToolsRoot "node"
$ZipPath = Join-Path $ToolsRoot "node.zip"
$NodeVersion = "v22.14.0"
$NodeUrl = "https://nodejs.org/dist/$NodeVersion/node-$NodeVersion-win-x64.zip"

New-Item -ItemType Directory -Force -Path $ToolsRoot | Out-Null

if (-not (Test-Path (Join-Path $NodeDir "node.exe"))) {
  Write-Host "Downloading Node.js $NodeVersion..." -ForegroundColor Cyan
  Invoke-WebRequest -Uri $NodeUrl -OutFile $ZipPath
  Expand-Archive -Path $ZipPath -DestinationPath $ToolsRoot -Force
  $Extracted = Join-Path $ToolsRoot "node-$NodeVersion-win-x64"
  if (Test-Path $NodeDir) { Remove-Item $NodeDir -Recurse -Force }
  Move-Item -Force "$Extracted\*" $NodeDir
  Remove-Item $ZipPath -Force -ErrorAction SilentlyContinue
  Write-Host "Node.js installed to $NodeDir" -ForegroundColor Green
} else {
  Write-Host "Node.js already present at $NodeDir" -ForegroundColor Green
}

$env:PATH = "$NodeDir;$env:PATH"
Set-Location $PSScriptRoot

Write-Host "Installing project dependencies..." -ForegroundColor Cyan
npm install

Write-Host "Installing Cypress binary..." -ForegroundColor Cyan
npx cypress install

Write-Host ""
Write-Host "Setup complete! Start the app with:" -ForegroundColor Green
Write-Host "  powershell -ExecutionPolicy Bypass -File .\dev.ps1" -ForegroundColor Cyan
Write-Host ""
