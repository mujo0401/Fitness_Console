@echo off
echo Starting Fitbit Dashboard in DEVELOPMENT mode...

:: Set environment variable to use development config
set FLASK_ENV=development

:: Kill any processes running on ports 3000 and 5000
echo Checking for processes already using ports 3000 and 5000...

:: Kill process on port 3000 (React)
for /f "tokens=5" %%a in ('netstat -ano ^| find "LISTENING" ^| find ":3000"') do (
    echo Killing process with PID %%a on port 3000
    taskkill /F /PID %%a 2>nul
)

:: Kill process on port 5000 (Flask)
for /f "tokens=5" %%a in ('netstat -ano ^| find "LISTENING" ^| find ":5000"') do (
    echo Killing process with PID %%a on port 5000
    taskkill /F /PID %%a 2>nul
)

echo Ports cleared.

:: Install the correct Flask Session package if needed
echo Checking for Flask-Session package...
call venv\Scripts\activate && pip install Flask-Session

:: Start backend server
echo Starting backend server (Development)...
start cmd /k "call venv\Scripts\activate && cd backend && python app.py"

:: Wait a moment to ensure backend starts first
timeout /t 2 /nobreak >nul

:: Start frontend server
echo Starting frontend server (Development)...
start cmd /k "cd frontend && npm start"

echo Both development servers are running!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C in each window to stop the servers when done.