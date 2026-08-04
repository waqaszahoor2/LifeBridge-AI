$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

if (-not (Get-Command python -ErrorAction SilentlyContinue)) { throw "Python is not installed or not on PATH." }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js is not installed or not on PATH." }
if (-not (Test-Path "$Root\config\apis.env")) { python "$Root\scripts\generate_secrets.py" }

Push-Location "$Root\apps\backend"
python -m venv .venv
& .\.venv\Scripts\python.exe -m pip install --upgrade pip
& .\.venv\Scripts\pip.exe install -r requirements.txt -r requirements-dev.txt
& .\.venv\Scripts\alembic.exe upgrade head
Pop-Location

Push-Location "$Root\apps\web"
npm install
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
Pop-Location

python "$Root\scripts\validate_project.py"
Write-Host "Setup complete. Review config\apis.env, then run scripts\run_local.ps1"
