@echo off
title CardioScan Launcher
echo ===================================================
echo   CardioScan: AI ECG Arrhythmia Detection System
echo ===================================================

echo.
echo [1/2] Launching Flask Backend...
start "CardioScan - Backend API" cmd /k "cd backend && venv\Scripts\activate && python app.py"

echo.
echo [2/2] Launching React Frontend...
:: The -- --open flag tells Vite to open the browser automatically
start "CardioScan - Frontend UI" cmd /k "cd ecg-arrhythmia && npm run dev -- --open"

echo.
echo ===================================================
echo   System is starting up!
echo   - Backend: http://localhost:5000
echo   - Frontend: check the opened browser tab
echo.
echo   Don't close the popup windows!
echo ===================================================
pause
