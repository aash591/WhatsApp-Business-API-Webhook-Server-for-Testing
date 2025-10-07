@echo off
title Installing WhatsApp Webhook Dependencies
color 0A
echo.
echo ================================================
echo    WhatsApp Webhook Server - Installation
echo ================================================
echo.
echo Checking Node.js installation...
node --version
if errorlevel 1 (
    echo.
    echo [ERROR] Node.js is NOT installed!
    echo.
    echo Please download and install Node.js from:
    echo https://nodejs.org/
    echo.
    pause
    exit
)
echo [OK] Node.js is installed
echo.
echo Installing dependencies...
call npm install
echo.
if errorlevel 1 (
    echo [ERROR] Installation failed!
    pause
    exit
)
echo [SUCCESS] Installation completed successfully!
echo.
echo Next steps:
echo 1. Edit config.json with your WhatsApp tokens
echo 2. Double-click START_SERVER.bat to run
echo.
pause