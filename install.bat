@echo off
REM DKN Backend Installation Script for Windows

echo.
echo ======================================
echo   DKN Backend Setup Script
echo ======================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js detected
echo.

REM Change to backend directory
cd DKN-Backend

echo Installing npm dependencies...
echo.
call npm install

if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo ======================================
echo   Installation Complete!
echo ======================================
echo.
echo Next steps:
echo.
echo 1. Ensure PostgreSQL is installed and running
echo    Download from: https://www.postgresql.org/download/windows/
echo.
echo 2. Create database:
echo    psql -U postgres
echo    CREATE DATABASE velion_dkn;
echo    \q
echo.
echo 3. Update .env file with your PostgreSQL password
echo.
echo 4. Seed default users and initialize database:
echo    npm run seed
echo.
echo 5. Start the backend server:
echo    npm run dev
echo.
echo Backend will run on: http://localhost:5000
echo.
pause
