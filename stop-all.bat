@echo off
echo ========================================
echo   DentalCare+ - Stopping All Services
echo ========================================
echo.

echo [1/2] Stopping Docker containers...
docker-compose down
if %errorlevel% neq 0 (
    echo ERROR: Failed to stop Docker containers
    pause
    exit /b 1
)
echo ✅ Docker containers stopped!
echo.

echo [2/2] Closing Android Emulator...
echo Please close the emulator window manually if it's still running.
echo.

echo ========================================
echo   All Services Stopped!
echo ========================================
echo.
pause
