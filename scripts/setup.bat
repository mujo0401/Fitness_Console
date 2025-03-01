@echo off
echo Setting up Fitbit Dashboard application...

:: Create Python virtual environment
echo Creating Python virtual environment...
python -m venv venv
call venv\Scripts\activate

:: Install backend dependencies
echo Installing backend dependencies...
pip install -r requirements.txt

:: Deactivate virtual environment
call deactivate

:: Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
npm install
cd ..

echo Setup complete! You can now run the application with scripts\start.bat