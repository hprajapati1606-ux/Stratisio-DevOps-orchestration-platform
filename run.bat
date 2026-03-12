@echo off
echo ==========================================
echo StratisIO Enterprise - One-Click Start
echo ==========================================

echo [1/3] Seeding database with fresh telemetry...
cd backend
python seed.py

echo [2/3] Starting FastAPI Backend on port 8000...
start cmd /k "uvicorn main:app --reload --port 8000 --host 0.0.0.0"

echo [3/3] Starting Next.js Frontend on port 3000...
cd ..\frontend
start cmd /k "npm run dev"

echo Waiting for services to initialize...
timeout /t 5

echo Opening dashboard...
start http://localhost:3000

echo Services are running. Close the terminal windows to stop.
pause
