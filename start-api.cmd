@echo off
REM ============================================================
REM  SGN CMS API — run from sgn-website-backend project root
REM  Recommended: C:\sgn-website-backend\
REM  Do NOT run from IIS neu\ (static files only)
REM ============================================================

setlocal
cd /d "%~dp0"

if not exist "package.json" (
  echo.
  echo ERROR: package.json not found in:
  echo   %cd%
  echo.
  echo Run from the backend project folder, for example:
  echo   C:\sgn-website-backend\start-api.cmd
  echo.
  pause
  exit /b 1
)

if not exist "server\index.ts" (
  echo.
  echo ERROR: server\index.ts missing in %cd%
  echo This does not look like the sgn-website-backend project.
  echo.
  pause
  exit /b 1
)

if not exist ".env" (
  echo.
  echo ERROR: .env missing in %cd%
  echo Copy .env.example to .env and set MSSQL_SERVER, MSSQL_DATABASE,
  echo MSSQL_USER, MSSQL_PASSWORD. Also set: PUBLIC_BASE_PATH=/neu
  echo.
  pause
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo.
  echo ERROR: npm not found. Install Node.js LTS from https://nodejs.org
  echo then open a NEW command prompt and try again.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Installing npm packages ^(first run^)...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

echo.
echo Starting SGN API on http://127.0.0.1:3001
echo Health:  http://127.0.0.1:3001/api/health
echo Virtual tour table: dbo.WebsiteVirtualTour  ^( /api/virtual-tour ^)
echo Holidays table: dbo.WebsiteHolidays  ^( /api/holidays ^)
echo School Information table: dbo.WebsiteSchoolInformation  ^( /api/school-information ^)
echo.
echo Keep this window OPEN. Closing it stops the CMS / MSSQL connection.
echo.

call npm run start:api
echo.
echo API exited.
pause
