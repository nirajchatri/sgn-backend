# SGN Website Backend API

REST API for **Shanti Gyan Niketan** website content, backed by Microsoft SQL Server (`sgncms`).

## Prerequisites

- Node.js 18+
- Network access to the MSSQL host

## Setup

```bash
npm install
cp .env.example .env   # then set DB_* values
npm run db:migrate     # create database + tables
npm run db:seed        # seed school settings + admin user
npm run dev            # http://localhost:4000
```

## Environment

| Variable | Description |
|----------|-------------|
| `DB_SERVER` | MSSQL host (e.g. `172.31.11.96`) |
| `DB_PORT` | Port (default `1433`) |
| `DB_NAME` | Database name (`sgncms`) |
| `DB_USER` / `DB_PASSWORD` | SQL login |
| `CORS_ORIGIN` | Allowed frontend origins |

Credentials live in `.env` only (gitignored).

## Tables

| Table | Purpose |
|-------|---------|
| `SchoolSettings` | School info / site settings |
| `CmsUsers` | CMS login accounts |
| `Notices` | Circulars & notices |
| `Facilities` | Campus facilities |
| `CurriculumStages` | NEP curriculum stages |
| `SeniorStreams` | XI–XII streams |
| `Houses` | Student houses |
| `BlogPosts` | School blog |
| `Faculty` | Faculty profiles |
| `Testimonials` | Parent / alumni quotes |
| `AcademicCalendar` | Term calendar |
| `FeeStructures` / `TransportFeeSlabs` | Fee data |
| `Banners` | Homepage banners |
| `Announcements` | Marquee announcements |
| `AdmissionInquiries` | Admission form submissions |
| `ContactMessages` | Contact form messages |

## Main endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Service + DB status |
| `POST` | `/api/auth/login` | CMS login |
| `GET`/`PUT` | `/api/school` | School settings |
| `GET`/`POST`/`PUT`/`DELETE` | `/api/notices` | Notices CRUD |
| `GET`/`POST`/`PUT`/`DELETE` | `/api/facilities` | Facilities CRUD |
| `GET` | `/api/curriculum` | Curriculum stages |
| `GET` | `/api/streams` | Senior streams |
| `GET` | `/api/houses` | Houses |
| `GET` | `/api/blog` | Blog posts |
| `GET` | `/api/faculty` | Faculty |
| `GET` | `/api/testimonials` | Testimonials |
| `GET` | `/api/calendar` | Academic calendar |
| `GET` | `/api/fees` | Fee structure |
| `GET` | `/api/banners` | Homepage banners |
| `GET` | `/api/announcements` | Announcements |
| `POST` | `/api/admissions` | Admission inquiry |
| `POST` | `/api/contact` | Contact message |

Public list endpoints return published/active rows by default. Pass `?all=true` to include drafts.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` / `npm start` | Production build & run |
| `npm run db:migrate` | Ensure DB + create tables |
| `npm run db:seed` | Seed baseline content |

## Frontend

Point the sgn-website app at this API, e.g. `http://localhost:4000/api`.
