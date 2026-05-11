@echo off
title Hissab Dashboard - Starting Servers...

echo ========================================
echo   Hissab Dashboard - Dev Servers
echo ========================================
echo.

:: Start Backend
echo [1/2] Starting Backend Server...
start "Hissab Backend" cmd /k "cd /d %~dp0backend && npm run dev"

:: Small delay to let backend initialize first
timeout /t 3 /nobreak > nul

:: Start Frontend
echo [2/2] Starting Frontend Server...
start "Hissab Frontend" cmd /k "cd /d %~dp0frontend && ng serve"

echo.
echo ========================================
echo   Both servers are starting!
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:4200
echo ========================================
echo.
echo You can close this window.
timeout /t 5
