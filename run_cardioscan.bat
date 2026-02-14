@echo off
title HeartAlert AI Launcher
echo ===================================================
echo   HeartAlert AI: AI ECG Arrhythmia Detection System
echo ===================================================

echo.
echo [1/2] Starting Backend Server (Flask)...
start "HeartAlert AI - Backend API" cmd /k "cd backend && venv\Scripts\activate && python app.py"

echo.
echo [2/2] Starting Frontend Interface (React)...
:: The -- --open flag tells Vite to open the browser automatically
start "HeartAlert AI - Frontend UI" cmd /k "cd ecg-arrhythmia && npm run dev -- --open"

echo.
echo ===================================================
echo   System is starting up!
echo   - Backend: http://localhost:5000
echo   - Frontend: check the opened browser tab
echo.
echo   Don't close the popup windows!
echo ===================================================
pause
