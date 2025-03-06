#!/bin/bash
echo "Starting Fitbit Dashboard in DEVELOPMENT mode..."

# Set environment to development
export FLASK_ENV=development

# Function to kill processes on a specific port
kill_process_on_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ -n "$pid" ]; then
        echo "Killing process $pid on port $port"
        kill -9 $pid
    else
        echo "No process found on port $port"
    fi
}

# Kill any processes running on ports 3000 and 5000
echo "Checking for processes already using ports 3000 and 5000..."
kill_process_on_port 3000
kill_process_on_port 5000
echo "Ports cleared."

# Change to project root directory
cd "$(dirname "$0")/.."

# Install Flask-Session if needed
echo "Checking for Flask-Session package..."
source venv/Scripts/activate
pip install Flask-Session

# Start backend server
echo "Starting backend server (Development)..."
cd backend
python app.py &
BACKEND_PID=$!

# Wait a moment to ensure backend starts first
sleep 2

# Start frontend server
echo "Starting frontend server (Development)..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "Both development servers are running!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the servers when done."

# Handle graceful shutdown
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait