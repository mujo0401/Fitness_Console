#!/bin/bash
echo "Starting Fitbit Dashboard application..."

# Start backend server
echo "Starting backend server..."
cd "$(dirname "$0")/.."
source venv/Scripts/activate
cd backend
python app.py &
BACKEND_PID=$!

# Wait a moment to ensure backend starts first
sleep 2

# Start frontend server
echo "Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "Both servers are running!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the servers when done."

# Handle graceful shutdown
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait