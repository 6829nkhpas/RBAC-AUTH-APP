# =========================================================================================
# Antigravity Task Manager - Setup & Startup Orchestrator (PowerShell Windows)
# =========================================================================================

Clear-Host
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "     ⚡ ANTIGRAVITY TASK MANAGER - SETUP & RUN ENGINE ⚡     " -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# ---------------------------------------------------------
# Step 1: Pre-requisites Verification
# ---------------------------------------------------------
Write-Host "[1/4] Checking Node.js environment installation..." -ForegroundColor Blue
$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCheck) {
    Write-Host "❌ Error: Node.js is not installed on this system or not in system environment PATH!" -ForegroundColor Red
    Write-Host "Please download Node.js from https://nodejs.org/ before running this setup script." -ForegroundColor Yellow
    Exit 1
} else {
    $nodeVersion = node -v
    Write-Host "✔ Node.js detected: $nodeVersion" -ForegroundColor Green
}
Write-Host ""

# ---------------------------------------------------------
# Step 2: Backend Setup & Database Migration
# ---------------------------------------------------------
Write-Host "[2/4] Setting up Backend REST API module..." -ForegroundColor Blue

if (-not (Test-Path "backend")) {
    Write-Host "❌ Error: Cannot find 'backend' directory. Please run this script from the project root." -ForegroundColor Red
    Exit 1
}

# 1. Resolve environment configuration file
if (-not (Test-Path "backend/.env")) {
    Write-Host "👉 File backend/.env not found. Seeding from template..." -ForegroundColor Yellow
    Copy-Item "backend/.env.example" "backend/.env"
    Write-Host "✔ Created backend/.env successfully." -ForegroundColor Green
} else {
    Write-Host "✔ backend/.env configuration file already exists." -ForegroundColor Green
}

# 2. Install backend packages
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Push-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend npm install failed." -ForegroundColor Red
    Pop-Location
    Exit 1
}

# 3. Prisma setup & migration deployments
Write-Host "⚙ Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "🗄 Deploying relational database migrations..." -ForegroundColor Yellow
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Database migration deployment failed." -ForegroundColor Red
    Pop-Location
    Exit 1
}
Write-Host "✔ Backend setup complete." -ForegroundColor Green
Pop-Location
Write-Host ""

# ---------------------------------------------------------
# Step 3: Frontend Scaffolding Setup
# ---------------------------------------------------------
Write-Host "[3/4] Setting up Frontend Dashboard client..." -ForegroundColor Blue

if (-not (Test-Path "frontend")) {
    Write-Host "❌ Error: Cannot find 'frontend' directory." -ForegroundColor Red
    Exit 1
}

# Install frontend packages
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Push-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend npm install failed." -ForegroundColor Red
    Pop-Location
    Exit 1
}
Write-Host "✔ Frontend setup complete." -ForegroundColor Green
Pop-Location
Write-Host ""

# ---------------------------------------------------------
# Step 4: Run Development Services
# ---------------------------------------------------------
Write-Host "[4/4] Activating server gateways..." -ForegroundColor Blue
Write-Host "Spawning dev instances in standalone consoles..." -ForegroundColor Yellow

# Spawn Backend Express Server (using cmd.exe for native cross-console title compatibility)
Start-Process cmd.exe -ArgumentList "/c", "title Backend-Express-API && cd backend && npm run dev"
Write-Host "✔ Backend Dev Server spawned at http://localhost:5000" -ForegroundColor Green

# Spawn Frontend Vite Client
Start-Process cmd.exe -ArgumentList "/c", "title Frontend-Vite-React && cd frontend && npm run dev"
Write-Host "✔ Frontend Dev Client spawned at http://localhost:5173" -ForegroundColor Green

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  ✨ ALL SERVICES RUNNING SUCCESSFULLY IN BACKGROUND ✨  " -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "👉 Test REST Endpoints & Swagger JSDocs: http://localhost:5000/api/v1/docs" -ForegroundColor Yellow
Write-Host "👉 Test Responsive UI Client:             http://localhost:5173" -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""
