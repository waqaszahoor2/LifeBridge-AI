$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Push-Location $Root
python ml/scripts/train_all.py
Pop-Location
Write-Host "Models written to ml/models. Bundled datasets are synthetic and for testing only."
