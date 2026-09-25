#!/usr/bin/env bash
# SGN CMS API — run from this project root on Ubuntu (or Mac).
# Deploy folder example: /home/ubuntu/sgn-website-backend/
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -f package.json ]]; then
  echo "ERROR: package.json not found in $(pwd)"
  echo "Run this from the sgn-website-backend project root."
  exit 1
fi

if [[ ! -f server/index.ts ]]; then
  echo "ERROR: server/index.ts missing in $(pwd)"
  echo "This does not look like the CMS API project."
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "ERROR: .env missing in $(pwd)"
  echo "Copy .env.example to .env and set MSSQL_* and PUBLIC_BASE_PATH=/neu"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm not found. Install Node.js 20+ LTS."
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "Installing npm packages (first run)…"
  npm install
fi

echo ""
echo "Starting SGN API on http://0.0.0.0:3001"
echo "Health: http://127.0.0.1:3001/api/health"
echo "Virtual tour: GET/PUT /api/virtual-tour → dbo.WebsiteVirtualTour"
echo "Holidays: GET/PUT /api/holidays → dbo.WebsiteHolidays"
echo "School Information: GET/PUT /api/school-information → dbo.WebsiteSchoolInformation"
echo "Keep this process running (use pm2 in production)."
echo ""

exec npm run start:api
