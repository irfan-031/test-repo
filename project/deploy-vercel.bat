@echo off
echo ========================================
echo Smart Emergency Response App
echo Vercel Deployment Script
echo ========================================
echo.

echo Checking if Vercel CLI is installed...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
) else (
    echo Vercel CLI is already installed.
)

echo.
echo Building the project...
npm run build

if %errorlevel% neq 0 (
    echo Build failed! Please check the errors above.
    pause
    exit /b 1
)

echo.
echo Build successful! Deploying to Vercel...
echo.
vercel --prod

echo.
echo Deployment complete!
echo Your app should be available at the URL shown above.
pause 