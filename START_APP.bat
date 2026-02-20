@echo off
echo ========================================
echo 🚀 Starting DentalCare+ Application
echo ========================================
echo.
echo This will start both Backend and Mobile App
echo.
echo Opening two windows:
echo   1. Backend Server (Node.js)
echo   2. Mobile App (Flutter)
echo.
echo ========================================
echo.

REM Start backend in new window
start "DentalCare+ Backend" cmd /k "cd backend && START_BACKEND.bat"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start mobile app in new window
start "DentalCare+ Mobile App" cmd /k "cd mobile && START_MOBILE.bat"

echo.
echo ✅ Both services starting...
echo.
echo Backend: http://localhost:4000/api
echo Mobile: Check the Flutter window for device selection
echo.
echo Close the windows to stop the services.
echo.



