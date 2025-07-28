@echo off
echo Navigating to the correct project directory...
cd /d "%~dp0project"
echo Current directory: %CD%
echo.
echo Checking if package.json exists...
if exist package.json (
    echo Package.json found! Starting development server...
    echo.
    npm run dev
) else (
    echo ERROR: package.json not found in current directory
    echo Please make sure you're in the correct project directory
    pause
) 