@echo off
echo Starting Fitbit Dashboard application...

:: Start backend server
echo Starting backend server...
start cmd /k "call venv\Scripts\activate && cd backend && python app.py"

:: Wait a moment to ensure backend starts first
timeout /t 2 /nobreak >nul

:: Start frontend server
echo Starting frontend server...
start cmd /k "cd frontend && npm start"

echo Both servers are running!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C in each window to stop the servers when done.