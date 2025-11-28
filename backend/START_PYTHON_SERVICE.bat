@echo off
echo ===========================================
echo   Starting Python AI Model Service
echo ===========================================
echo.

cd /d %~dp0
py python-service/app.py

pause



