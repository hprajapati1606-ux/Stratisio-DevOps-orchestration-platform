# StratisIO Enterprise - One-Click Launcher
# This script starts the FastAPI Backend and Next.js Frontend automatically.

Write-Host "--------------------------------------------------------" -ForegroundColor Gray
Write-Host "   STRATISIO ENTERPRISE (FASTAPI + NEXT.JS)          " -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Gray

$ROOT_DIR = $PSScriptRoot
$BACKEND_DIR = Join-Path $ROOT_DIR "backend"
$FRONTEND_DIR = Join-Path $ROOT_DIR "frontend"

# 1. Start Backend API
Write-Host "[1/2] Launching FastAPI Backend (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -LiteralPath '$BACKEND_DIR'; powershell -ExecutionPolicy Bypass -File .\run_backend.ps1"

# Wait for Backend to initialize
Write-Host "Waiting for backend to sync..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# 2. Start Frontend Console
Write-Host "[2/2] Launching Next.js Frontend (Port 3000)..." -ForegroundColor Yellow
# Ensure node_modules exist
if (-not (Test-Path (Join-Path $FRONTEND_DIR "node_modules"))) {
    Write-Host "Installing frontend dependencies (npm install)..." -ForegroundColor Gray
    Set-Location -LiteralPath $FRONTEND_DIR
    npm install
}

$FRONTEND_COMMAND = "Set-Location -LiteralPath '$FRONTEND_DIR'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "$FRONTEND_COMMAND"

# 3. Open Browser
Write-Host "--------------------------------------------------------" -ForegroundColor Gray
Write-Host "SYSTEM INITIALIZED" -ForegroundColor Green
Write-Host "--------------------------------------------------------" -ForegroundColor Gray
Write-Host "Opening StratisIO Console in Chrome..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host "Keep the background PowerShell windows running!" -ForegroundColor DarkGray
