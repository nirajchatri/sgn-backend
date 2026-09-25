# SGN Website Backend (CMS API)

Standalone **Express + MSSQL** API for the Shanti Gyan Niketan website (`sgn-website` frontend).

Deploy **this project** to Ubuntu. Do not run the API from the frontend `dist/` / IIS `neu\` folder.

## Quick start (Ubuntu)

```bash
cd /home/ubuntu/sgn-website-backend
cp .env.example .env
nano .env                 # MSSQL_* + PUBLIC_BASE_PATH=/neu
npm install
npm run check:mssql
./start-api.sh
```

Or Windows: `start-api.cmd` from this folder (e.g. `C:\sgn-website-backend\`).

### PM2

```bash
sudo npm install -g pm2
cd /home/ubuntu/sgn-website-backend
pm2 start npm --name sgn-api -- run start:api
pm2 save
pm2 startup
```

Health: `http://SERVER:3001/api/health`

## Local (Mac)

```bash
npm install
cp .env.example .env   # point MSSQL_* at your DB
npm run check:mssql
npm run start:api      # or ./start-api.sh
```

Frontend (`sgn-website`) proxies `/api` → `http://127.0.0.1:3001` in Vite.

## Virtual tour (MSSQL)

| Piece | Detail |
|-------|--------|
| Table | `dbo.WebsiteVirtualTour` (created on API start via `ensureCmsSchema`) |
| API | `GET` / `PUT` `/api/virtual-tour` |

CMS UI: frontend **360° Virtual Tour** module.

## Holidays (MSSQL)

| Piece | Detail |
|-------|--------|
| Table | `dbo.WebsiteHolidays` (created on API start via `ensureCmsSchema`) |
| API | `GET` / `PUT` `/api/holidays` |

CMS UI: frontend **Holidays** module (`/cms/holidays`). Seeded from the legacy gazetted holidays list (session 2026-27).

## School Information (MSSQL)

| Piece | Detail |
|-------|--------|
| Table | `dbo.WebsiteSchoolInformation` (created on API start via `ensureCmsSchema`) |
| API | `GET` / `PUT` `/api/school-information` |

CMS UI: frontend **School Information** module (`/cms/school-information`). Seeded from the legacy CBSE disclosure page (`page.aspx?id=127`). Separate from site settings (`WebsiteSchoolInfo` / `/api/school-info`).

## Main CMS endpoints

| Path | Purpose |
|------|---------|
| `/api/health` | API + DB |
| `/api/cms` | Full CMS bundle |
| `/api/gallery` | Photo / video gallery |
| `/api/virtual-tour` | 360° tour spots |
| `/api/holidays` | Gazetted holidays / school breaks |
| `/api/school-information` | CBSE school information disclosure |
| `/api/pages`, `/api/menu`, `/api/notices`, … | Other Website* tables |
| `/api/uploads` | Image upload (CMS auth) |

## Pack for deploy

```bash
npm install
npm run pack
# → deploy/sgn-website-backend.tar.gz
```

## IIS frontend

Proxy `/neu/api` → `http://127.0.0.1:3001/api` (or this Ubuntu host).  
Upload frontend `dist/` to IIS `neu\` separately — never start the API from that folder.

### 502 Bad Gateway on CMS Save

IIS is proxying `/neu/api` but Node is not reachable at the URL in `web.config`.

```bash
cd /home/ubuntu/sgn-website-backend
curl -s http://127.0.0.1:3001/api/health          # must include WebsiteVirtualTour, WebsiteHolidays, WebsiteSchoolInformation
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001/api/virtual-tour
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001/api/holidays
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001/api/school-information
pm2 restart sgn-api   # or ./start-api.sh
```

On the IIS server, change `neu\web.config` API rewrite to `http://UBUNTU_IP:3001` if the API is not on Windows.
