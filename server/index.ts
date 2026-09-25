import cors from 'cors';
import express from 'express';
import {
  ensureCmsSchema,
  fetchAdmissions,
  fetchContact,
  fetchAbout,
  fetchGallery,
  fetchVirtualTour,
  fetchHolidays,
  fetchSchoolInformation,
  fetchAnnouncements,
  fetchAlumni,
  fetchBlogPosts,
  fetchCmsBundle,
  fetchHeroSlides,
  fetchHomeSections,
  fetchMenuItems,
  fetchNotices,
  fetchPages,
  fetchSchoolInfo,
  appendAlumni,
  replaceAdmissions,
  replaceContact,
  replaceAbout,
  replaceGallery,
  replaceVirtualTour,
  replaceHolidays,
  replaceSchoolInformation,
  replaceAnnouncements,
  replaceAlumni,
  replaceBlogPosts,
  replaceCmsBundle,
  replaceHeroSlides,
  replaceHomeSections,
  replaceMenuItems,
  replaceNotices,
  replacePages,
  replaceSchoolInfo,
  type AlumniPayload,
  type AnnouncementPayload,
  type BlogPostPayload,
  type HeroSlidePayload,
  type MenuItemPayload,
  type NoticePayload,
  type PagePayload,
} from './cmsStore.js';
import { getMssqlDiagnostics, loadEnv, pingDatabase } from './db.js';
import {
  ensureUploadsDir,
  listUploadedFiles,
  resolveUploadsDir,
  rewriteGalleryUploadUrls,
  rewriteVirtualTourUploadUrls,
  saveDataUrlImage,
  saveDataUrlPdf,
  savePdfBuffer,
} from './uploads.js';

loadEnv();

const app = express();
const port = Number(process.env.API_PORT || process.env.PORT || 3001);
const host = (process.env.API_HOST || '0.0.0.0').trim() || '0.0.0.0';
const cmsApiKey =
  process.env.CMS_API_KEY?.trim() ||
  `${
    process.env.CMS_ADMIN_USERNAME?.trim() ||
    process.env.VITE_CMS_USERNAME?.trim() ||
    'admin'
  }:${
    process.env.CMS_ADMIN_PASSWORD?.trim() ||
    process.env.VITE_CMS_PASSWORD?.trim() ||
    'sgn@cms2026'
  }`;

const uploadsDir = resolveUploadsDir();
ensureUploadsDir();
console.log(`Uploads directory: ${uploadsDir} (${listUploadedFiles().length} files)`);

/** Public URL prefix for uploaded files ('' = site root, '/neu' = legacy). */
function uploadsPublicBase(): string {
  const raw =
    process.env.PUBLIC_BASE_PATH?.trim() ||
    process.env.VITE_BASE_PATH?.trim() ||
    '';
  if (!raw || raw === '/') return '';
  return raw.startsWith('/') ? raw.replace(/\/$/, '') : `/${raw.replace(/\/$/, '')}`;
}

const corsOriginRaw = process.env.CORS_ORIGIN?.trim();
if (corsOriginRaw && corsOriginRaw !== '*') {
  const origins = corsOriginRaw.split(',').map((s) => s.trim()).filter(Boolean);
  app.use(
    cors({
      origin: origins,
      credentials: true,
      allowedHeaders: ['Content-Type', 'X-CMS-Key', 'Authorization', 'X-Filename'],
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    })
  );
} else {
  // Reflect request Origin — needed when CMS on shantigyanniketan.org calls api.*
  app.use(
    cors({
      origin: true,
      credentials: true,
      allowedHeaders: ['Content-Type', 'X-CMS-Key', 'Authorization', 'X-Filename'],
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    })
  );
}
const BODY_LIMIT = process.env.API_BODY_LIMIT?.trim() || '100mb';
app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: BODY_LIMIT }));
app.use('/uploads', express.static(uploadsDir, { maxAge: '7d', fallthrough: true }));

function requireCmsAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const key = req.header('x-cms-key') || '';
  if (key !== cmsApiKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

function sendError(res: express.Response, err: unknown, fallback: string) {
  console.error(fallback, err);
  const msg = err instanceof Error ? err.message : fallback;
  const status =
    typeof err === 'object' &&
    err &&
    'status' in err &&
    typeof (err as { status?: unknown }).status === 'number'
      ? (err as { status: number }).status
      : msg.toLowerCase().includes('entity too large')
        ? 413
        : 500;
  res.status(status).json({ error: msg });
}

app.get('/api/health', async (_req, res) => {
  const mssql = getMssqlDiagnostics();
  const db = await pingDatabase();
  const uploadFiles = listUploadedFiles();
  if (db.ok) {
    try {
      await ensureCmsSchema();
      res.json({
        ok: true,
        service: 'sgn-website-backend',
        api: true,
        database: 'mssql',
        mssql,
        uploads: {
          dir: uploadsDir,
          count: uploadFiles.length,
        },
        routes: [
          '/api/menu',
          '/api/virtual-tour',
          '/api/holidays',
          '/api/school-information',
          '/api/cms',
          '/api/uploads',
          '/api/uploads/document',
        ],
        tables: [
          'WebsiteMenuItems',
          'WebsiteNotices',
          'WebsiteHeroSlides',
          'WebsiteAnnouncements',
          'WebsiteBlogPosts',
          'WebsiteSchoolInfo',
          'WebsiteAdmissions',
          'WebsiteContact',
          'WebsiteAbout',
          'WebsiteGallery',
          'WebsiteVirtualTour',
          'WebsiteHolidays',
          'WebsiteSchoolInformation',
          'WebsitePages',
          'WebsiteHomeSections',
          'WebsiteAlumni',
        ],
      });
      return;
    } catch (err) {
      res.status(503).json({
        ok: false,
        api: true,
        database: 'mssql',
        mssql,
        uploads: { dir: uploadsDir, count: uploadFiles.length },
        error: err instanceof Error ? err.message : 'Schema check failed',
      });
      return;
    }
  }
  res.status(503).json({
    ok: false,
    api: true,
    database: 'mssql',
    mssql,
    uploads: { dir: uploadsDir, count: uploadFiles.length },
    error: db.error,
  });
});

app.get('/api/cms', async (_req, res) => {
  try {
    const content = await fetchCmsBundle();
    if (content.gallery) {
      content.gallery = rewriteGalleryUploadUrls(
        content.gallery,
        uploadsPublicBase()
      );
    }
    if (content.virtualTour) {
      content.virtualTour = rewriteVirtualTourUploadUrls(
        content.virtualTour,
        uploadsPublicBase()
      );
    }
    res.json({ content });
  } catch (err) {
    sendError(res, err, 'Failed to load CMS content from MSSQL');
  }
});

app.put('/api/cms', requireCmsAuth, async (req, res) => {
  try {
    const body = req.body as {
      content?: {
        menuItems: MenuItemPayload[];
        notices: NoticePayload[];
        heroSlides: HeroSlidePayload[];
        announcements: AnnouncementPayload[];
        blogPosts: BlogPostPayload[];
        schoolInfo: Record<string, unknown>;
        admissions: Record<string, unknown>;
        contact?: Record<string, unknown>;
        about?: Record<string, unknown>;
        gallery?: Record<string, unknown>;
        virtualTour?: Record<string, unknown>;
        holidays?: Record<string, unknown>;
        schoolInformation?: Record<string, unknown>;
        pages: PagePayload[];
        homeSections: Record<string, unknown>;
        alumni: AlumniPayload[];
      };
    };
    if (!body.content) {
      res.status(400).json({ error: 'Body must include content' });
      return;
    }
    const content = await replaceCmsBundle({
      ...body.content,
      alumni: body.content.alumni ?? [],
    });
    res.json({ content });
  } catch (err) {
    sendError(res, err, 'Failed to save CMS content to MSSQL');
  }
});

function listRoute<T>(
  path: string,
  fetchFn: () => Promise<T[]>,
  replaceFn: (items: T[]) => Promise<T[]>,
  key: string
) {
  app.get(path, async (_req, res) => {
    try {
      const items = await fetchFn();
      res.json({ items });
    } catch (err) {
      sendError(res, err, `Failed to load ${key} from MSSQL`);
    }
  });

  app.put(path, requireCmsAuth, async (req, res) => {
    try {
      const body = req.body as { items?: T[] };
      if (!Array.isArray(body.items)) {
        res.status(400).json({ error: `Body must include items for ${key}` });
        return;
      }
      const items = await replaceFn(body.items);
      res.json({ items });
    } catch (err) {
      sendError(res, err, `Failed to save ${key} to MSSQL`);
    }
  });
}

function singletonRoute(
  path: string,
  fetchFn: () => Promise<Record<string, unknown> | null>,
  replaceFn: (payload: Record<string, unknown>) => Promise<Record<string, unknown>>,
  key: string
) {
  app.get(path, async (_req, res) => {
    try {
      let data = await fetchFn();
      if (key === 'gallery') {
        data = rewriteGalleryUploadUrls(data, uploadsPublicBase());
      }
      if (key === 'virtual tour') {
        data = rewriteVirtualTourUploadUrls(data, uploadsPublicBase());
      }
      res.json({ data });
    } catch (err) {
      sendError(res, err, `Failed to load ${key} from MSSQL`);
    }
  });

  app.put(path, requireCmsAuth, async (req, res) => {
    try {
      const body = req.body as { data?: Record<string, unknown> };
      if (!body.data || typeof body.data !== 'object') {
        res.status(400).json({ error: `Body must include data for ${key}` });
        return;
      }
      let payload = body.data;
      if (key === 'gallery') {
        payload =
          rewriteGalleryUploadUrls(payload, uploadsPublicBase()) || payload;
      }
      if (key === 'virtual tour') {
        payload =
          rewriteVirtualTourUploadUrls(payload, uploadsPublicBase()) || payload;
      }
      const data = await replaceFn(payload);
      res.json({
        data:
          key === 'gallery'
            ? rewriteGalleryUploadUrls(data, uploadsPublicBase())
            : key === 'virtual tour'
              ? rewriteVirtualTourUploadUrls(data, uploadsPublicBase())
              : data,
      });
    } catch (err) {
      sendError(res, err, `Failed to save ${key} to MSSQL`);
    }
  });
}

listRoute('/api/menu', fetchMenuItems, replaceMenuItems, 'menu');
listRoute('/api/notices', fetchNotices, replaceNotices, 'notices');
listRoute('/api/hero-slides', fetchHeroSlides, replaceHeroSlides, 'hero slides');
listRoute('/api/announcements', fetchAnnouncements, replaceAnnouncements, 'announcements');
listRoute('/api/blog-posts', fetchBlogPosts, replaceBlogPosts, 'blog posts');
listRoute('/api/pages', fetchPages, replacePages, 'pages');
listRoute('/api/alumni', fetchAlumni, replaceAlumni, 'alumni');
singletonRoute('/api/school-info', fetchSchoolInfo, replaceSchoolInfo, 'school info');
singletonRoute('/api/admissions', fetchAdmissions, replaceAdmissions, 'admissions');
singletonRoute('/api/contact', fetchContact, replaceContact, 'contact');
singletonRoute('/api/about', fetchAbout, replaceAbout, 'about');
singletonRoute('/api/gallery', fetchGallery, replaceGallery, 'gallery');
singletonRoute('/api/virtual-tour', fetchVirtualTour, replaceVirtualTour, 'virtual tour');
singletonRoute('/api/holidays', fetchHolidays, replaceHolidays, 'holidays');
singletonRoute(
  '/api/school-information',
  fetchSchoolInformation,
  replaceSchoolInformation,
  'school information'
);
singletonRoute('/api/home-sections', fetchHomeSections, replaceHomeSections, 'home sections');

/** Store one CMS image on disk; returns a short /uploads URL (avoids huge JSON payloads). */
app.post('/api/uploads', requireCmsAuth, async (req, res) => {
  try {
    const dataUrl = typeof req.body?.dataUrl === 'string' ? req.body.dataUrl : '';
    const filenameHint =
      typeof req.body?.filename === 'string' ? req.body.filename : undefined;
    if (dataUrl.startsWith('data:application/pdf')) {
      const saved = saveDataUrlPdf(dataUrl, filenameHint);
      res.status(201).json({ url: saved.url, filename: saved.filename, kind: 'pdf' });
      return;
    }
    if (!dataUrl.startsWith('data:image/')) {
      res.status(400).json({
        error: 'dataUrl (image or PDF data URL) is required',
      });
      return;
    }
    const saved = saveDataUrlImage(dataUrl);
    // Always return root-relative /uploads/… (never /neu/uploads) — public site is at app.* root
    res.status(201).json({
      url: saved.url,
      filename: saved.filename,
      kind: 'image',
    });
  } catch (err) {
    sendError(res, err, 'Failed to upload file');
  }
});

/**
 * Binary PDF upload for School Information (and similar).
 * Body = raw PDF bytes; Content-Type: application/pdf; optional X-Filename header.
 * File is written to UPLOADS_DIR (IIS site uploads share in production).
 */
app.post(
  '/api/uploads/document',
  requireCmsAuth,
  express.raw({
    type: (req) => {
      const ct = (req.headers['content-type'] || '').toLowerCase();
      return (
        ct.includes('application/pdf') ||
        ct.includes('application/octet-stream') ||
        ct === ''
      );
    },
    limit: '25mb',
  }),
  async (req, res) => {
    try {
      const body = req.body;
      const buffer = Buffer.isBuffer(body)
        ? body
        : body instanceof ArrayBuffer
          ? Buffer.from(body)
          : Buffer.isBuffer((body as { data?: Buffer })?.data)
            ? (body as { data: Buffer }).data
            : null;
      if (!buffer?.length) {
        res.status(400).json({
          error:
            'PDF body required. Send raw application/pdf bytes with X-CMS-Key (and optional X-Filename).',
        });
        return;
      }
      const nameHint =
        typeof req.header('x-filename') === 'string'
          ? decodeURIComponent(req.header('x-filename') || '')
          : 'document.pdf';
      const saved = savePdfBuffer(buffer, nameHint);
      res.status(201).json({
        url: saved.url,
        filename: saved.filename,
        kind: 'pdf',
      });
    } catch (err) {
      sendError(res, err, 'Failed to upload PDF');
    }
  }
);

/** Public alumni directory — approved only */
app.get('/api/alumni/public', async (_req, res) => {
  try {
    const items = (await fetchAlumni()).filter((a) => a.status === 'approved');
    res.json({ items });
  } catch (err) {
    sendError(res, err, 'Failed to load alumni');
  }
});

/** Public registration — creates pending alumni record */
app.post('/api/alumni/register', async (req, res) => {
  try {
    const body = req.body as Partial<AlumniPayload>;
    if (!body.fullName?.trim() || !body.email?.trim() || !body.batchYear?.trim()) {
      res.status(400).json({ error: 'fullName, email, and batchYear are required' });
      return;
    }
    const item: AlumniPayload = {
      id: `alumni-${Date.now()}`,
      fullName: body.fullName.trim(),
      batchYear: String(body.batchYear).trim(),
      classPassed: (body.classPassed || '').trim() || 'Class XII',
      fatherName: body.fatherName?.trim() || undefined,
      currentRole: (body.currentRole || '').trim() || 'Alumni',
      organization: body.organization?.trim() || undefined,
      location: body.location?.trim() || undefined,
      email: body.email.trim(),
      phone: body.phone?.trim() || undefined,
      linkedIn: body.linkedIn?.trim() || undefined,
      photoUrl: body.photoUrl?.trim() || undefined,
      bio: body.bio?.trim() || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const created = await appendAlumni(item);
    res.status(201).json({ item: created });
  } catch (err) {
    sendError(res, err, 'Failed to register alumni');
  }
});

/** Clear 413 when JSON body exceeds API_BODY_LIMIT (default 100mb). */
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (!err || typeof err !== 'object') {
      next(err);
      return;
    }
    const e = err as { type?: string; status?: number; statusCode?: number; message?: string };
    if (e.type === 'entity.too.large' || e.status === 413 || e.statusCode === 413) {
      res.status(413).json({
        error:
          'Request entity too large. Use Upload for images (not huge pasted data). ' +
          'On Ubuntu nginx set: client_max_body_size 100M; then reload nginx. ' +
          'Or set API_BODY_LIMIT=100mb in .env and restart the API.',
      });
      return;
    }
    next(err);
  }
);

app.listen(port, host, () => {
  const mssql = getMssqlDiagnostics();
  console.log(`SGN API listening on http://${host}:${port}`);
  console.log(
    'CMS tables: menu, notices, hero-slides, announcements, blog, school-info, admissions, contact, about, gallery, virtual-tour, holidays, school-information, pages, home-sections, alumni'
  );
  if (mssql.mode === 'missing') {
    console.warn('MSSQL is not configured — set MSSQL_* in .env next to package.json');
  } else if (mssql.mode === 'connectionString') {
    console.log('MSSQL: using MSSQL_CONNECTION_STRING');
  } else {
    console.log(
      `MSSQL: ${mssql.user}@${mssql.server}:${mssql.port} / ${mssql.database}`
    );
  }
  void pingDatabase().then((db) => {
    if (db.ok) console.log('MSSQL: connection OK');
    else console.error('MSSQL: connection FAILED —', db.error);
  });
});
