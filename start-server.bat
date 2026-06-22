@echo off
title Portfolio Server
color 0A
echo.
echo  ╔═══════════════════════════════════════════════════╗
echo  ║         Starting Portfolio Backend...             ║
echo  ╚═══════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

:: Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

:: Check if dependencies are installed
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
)

echo.
echo [INFO] Starting server on http://localhost:3000
echo [INFO] Press Ctrl+C to stop the server
echo.

node server/server.js

pause
