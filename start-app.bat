@echo off
cd /d "%~dp0"
start "Flask Backend" cmd /k ".\.venv\Scripts\python.exe app.py"
TIMEOUT /T 2 >nul
start "Store Frontend" cmd /k ".\.venv\Scripts\python.exe server.py"
start "" http://localhost:3000
exit
