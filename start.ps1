# Money Management - One-Click Startup Script
# Run from the project root: .\start.ps1

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$BACKEND  = Join-Path $ROOT "backend"
$FRONTEND = Join-Path $ROOT "frontend"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Money Management App - Starting Up    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start Django backend in a new PowerShell window
Write-Host "[1/2] Starting Django backend on http://127.0.0.1:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$BACKEND'; python manage.py runserver 8000"

# Wait so Django is ready before Vite proxy starts hitting it
Start-Sleep -Seconds 3

# Start Vite frontend in a new PowerShell window
Write-Host "[2/2] Starting Vite frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$FRONTEND'; npm run dev"

Write-Host ""
Write-Host "Both servers are starting in separate windows." -ForegroundColor Green
Write-Host "  Backend  -> http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "  Frontend -> http://localhost:5173"  -ForegroundColor Green
Write-Host ""
Write-Host "Close those two windows to stop the servers." -ForegroundColor DarkGray
