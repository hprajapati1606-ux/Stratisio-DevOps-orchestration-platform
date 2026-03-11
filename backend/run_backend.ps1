# StratisIO Enterprise Backend Setup (Python 3.14 Optimized)
# This script handles the experimental nature of Python 3.14

Write-Host "--- Start StratisIO Backend Setup ---" -ForegroundColor Cyan

# Ensure we are in the script's directory
Set-Location $PSScriptRoot

# 1. Ensure virtual environment exists
if (-not (Test-Path "venv_enterprise")) {
    Write-Host "Creating Virtual Environment (Python 3.14)..."
    python -m venv venv_enterprise
    
    Write-Host "Installing dependencies..."
    .\venv_enterprise\Scripts\python.exe -m pip install --upgrade pip
    
    $apps = @(
        "fastapi<0.100.0", 
        "uvicorn", 
        "sqlalchemy", 
        "pyjwt", 
        "python-multipart", 
        "pydantic<2.0.0", 
        "prometheus_client", 
        "kubernetes",
        "python-jose[cryptography]",
        "passlib",
        "bcrypt",
        "psutil",
        "docker",
        "scikit-learn",
        "prometheus-fastapi-instrumentator"
    )

    foreach ($app in $apps) {
        Write-Host "Installing $app..."
        .\venv_enterprise\Scripts\pip.exe install $app
    }
}
else {
    Write-Host "Virtual environment venv_enterprise already exists. Skipping setup." -ForegroundColor Yellow
}

Write-Host "--- Setup Complete ---" -ForegroundColor Green
Write-Host "Starting StratisIO Enterprise API Gateway..." -ForegroundColor Cyan

# 4. Start Server
.\venv_enterprise\Scripts\uvicorn.exe main:app --reload --host 0.0.0.0 --port 8000
