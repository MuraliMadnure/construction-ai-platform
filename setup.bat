@echo off
echo ========================================
echo Construction AI Platform - Setup Script
echo ========================================
echo.

REM Check Node.js
where node >/dev/null 2>/dev/null
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js >= 18.0.0 from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js detected
node -v
echo.

REM Backend setup
echo Setting up Backend...
cd backend

if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo WARNING: Please edit backend\.env and update your credentials!
)

echo Installing backend dependencies...
call npm install

echo Generating Prisma Client...
call npx prisma generate

echo Backend setup complete!
echo.

REM Frontend setup
echo Setting up Frontend...
cd ..\frontend

if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
)

echo Installing frontend dependencies...
call npm install

echo Frontend setup complete!
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit backend\.env with your database credentials
echo 2. Run: cd backend && npx prisma migrate dev
echo 3. Start backend: npm run dev
echo 4. In new terminal, start frontend: cd frontend && npm run dev
echo.
echo See QUICK_START.md for detailed instructions
echo.
pause
