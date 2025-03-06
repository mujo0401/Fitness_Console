@echo off
echo Starting Fitbit Dashboard in PRODUCTION mode...

:: Set environment variable to use production config
set FLASK_ENV=production

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
echo Starting backend server (Production)...
start cmd /k "call venv\Scripts\activate && cd backend && python app.py"

:: Wait a moment to ensure backend starts first
timeout /t 2 /nobreak >nul

:: Build and start frontend server - in production mode
echo Starting frontend server (Production)...
echo Building frontend...
cd frontend && npm run build

:: Start the production server
echo Starting production frontend server...
start cmd /k "cd frontend && npx serve -s build -l 3000"

echo Both production servers are running!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C in each window to stop the servers when done.