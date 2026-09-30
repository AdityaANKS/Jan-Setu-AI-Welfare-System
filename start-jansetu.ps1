# Jan-Setu AI (जन-सेतु) — One-Click Full-Stack Startup Script
Write-Host "Starting Jan-Setu AI Sovereign DPI Backend (FastAPI on port 8000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "Starting Jan-Setu AI Interactive Workbench (Vite + React on port 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "Jan-Setu AI launched! Open http://localhost:5173 in your browser." -ForegroundColor Yellow
