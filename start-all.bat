@echo off
echo ========================================
echo   DentalCare+ - Starting All Services
echo ========================================
echo.

echo [1/4] Starting Docker containers...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start Docker containers
    pause
    exit /b 1
)
echo ✅ Docker containers started!
echo.

echo [2/4] Checking Docker status...
docker ps
echo.

echo [3/4] Creating test patients for mobile app...
cd backend
node createTestPatient.js
cd ..
echo.

echo [4/4] Starting Android Emulator...
echo Please wait for emulator to start (this may take 1-2 minutes)...
start cmd /k "cd mobile && flutter emulators --launch Pixel_7_Pro_API_35"
echo.

echo ========================================
echo   Services Started Successfully!
echo ========================================
echo.
echo 📱 Web Frontend:  http://localhost:3000
echo 🔧 Backend API:   http://localhost:4000
echo 🤖 AI Model:      http://localhost:5000
echo 📊 MongoDB:       localhost:27017
echo.
echo 🔐 Login Credentials:
echo.
echo    WEB APP (Doctors):
echo    - doctor@test.com / Test123!
echo    - kavindu2002@gmail.com / password123
echo.
echo    MOBILE APP (Patients):
echo    - kavindu@patient.com / password123
echo    - nuwan@patient.com / password123
echo    - anoma@patient.com / password123
echo.
echo 📱 Mobile App: Wait for emulator to start, then run:
echo    cd mobile
echo    flutter run
echo.
echo Press any key to open browser...
pause > nul
start http://localhost:3000/doctor-login
