@echo off
echo ========================================
echo 📱 Starting DentalCare+ Mobile App
echo ========================================
echo.

REM Check if Flutter is installed
flutter --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Flutter not found!
    echo.
    echo Please install Flutter first:
    echo https://flutter.dev/docs/get-started/install
    pause
    exit /b 1
)

echo ✅ Flutter found!
echo.

REM Check if pubspec.lock exists (dependencies installed)
if not exist "pubspec.lock" (
    echo ⚠️  Dependencies not installed!
    echo.
    echo Installing dependencies...
    flutter pub get
    echo.
)

echo ✅ Starting Flutter app...
echo.
echo 📱 App will run on your connected device/emulator
echo.
echo Press Ctrl+C to stop the app
echo.

REM Start the app
flutter run

pause



