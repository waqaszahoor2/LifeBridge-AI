$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path "$Root\apps\backend\.venv")) { throw "Run scripts\setup_local.ps1 first." }
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\apps\backend'; .\.venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\apps\web'; npm run dev"
Write-Host "Started backend and web terminals. Optional worker: cd apps\backend; .venv\Scripts\python -m app.worker"
