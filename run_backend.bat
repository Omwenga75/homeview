@echo off
echo Starting HomeView Node Backend...
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    npm install
)
echo Starting server...
node server.js
pause
