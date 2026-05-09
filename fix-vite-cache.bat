@echo off
REM Fix Vite Module Cache Issues

echo.
echo ================================================
echo   Fixing Vite Cache Issues
echo ================================================
echo.

cd /d "%~dp0\frontend"

echo [1/3] Clearing Vite cache...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite" 2>nul
if exist ".vite" rmdir /s /q ".vite" 2>nul
if exist "dist" rmdir /s /q "dist" 2>nul
echo   Done: Cache cleared
echo.

echo [2/3] Cache directories removed
echo.

echo [3/3] Next steps:
echo   1. Run: npm run dev
echo   2. Hard refresh browser: Ctrl+Shift+R
echo.
echo ================================================
echo   Vite cache cleared successfully!
echo ================================================
echo.

pause
