@echo off
cd /d "%~dp0"
echo Starting Siga Siga...
where node >nul 2>nul
if errorlevel 1 (echo Node.js is not installed. Install from https://nodejs.org/ and rerun this file. & pause & exit /b 1)
if not exist node_modules\next (echo Installing website packages... & call npm install & if errorlevel 1 (echo Install failed. & pause & exit /b 1))
start "" http://localhost:3000
echo Keep this window open while using Siga Siga.
call npm run dev
pause
