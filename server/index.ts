import cors from 'cors';
import express from 'express';
import {
  ensureCmsSchema,
  fetchAdmissions,
  fetchContact,
  fetchAbout,
  fetchGallery,
  fetchVirtualTour,
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
} from './uploads.js';

loadEnv();

const app = express();
const port = Number(process.env.API_PORT || 3001);
const host = (process.env.API_HOST || '0.0.0.0').trim() || '0.0.0.0';
const cmsApiKey =
  process.env.CMS_API_KEY?.trim() ||
  `${process.env.VITE_CMS_USERNAME || 'admin'}:${process.env.VITE_CMS_PASSWORD || 'sgn@cms2026'}`;

const uploadsDir = resolveUploadsDir();
ensureUploadsDir();
console.log(`Uploads directory: ${uploadsDir} (${listUploadedFiles().length} image files)`);

/** Public URL prefix for uploaded files (site is under /neu/). */
function uploadsPublicBase(): string {
  const raw =
    process.env.PUBLIC_BASE_PATH?.trim() ||
    process.env.VITE_BASE_PATH?.trim() ||
    '/neu';
  if (!raw || raw === '/') return '';
  return raw.startsWith('/') ? raw.replace(/\/$/, '') : `/${raw.replace(/\/$/, '')}`;
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
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
  res.status(500).json({
    error: err instanceof Error ? err.message : fallback,
  });
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
        api: true,
        database: 'mssql',
        mssql,
        uploads: {
          dir: uploadsDir,
          count: uploadFiles.length,
        },
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
        uploadsPublicBase() || '/neu'
      );
    }
    if (content.virtualTour) {
      content.virtualTour = rewriteVirtualTourUploadUrls(
        content.virtualTour,
        uploadsPublicBase() || '/neu'
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
        data = rewriteGalleryUploadUrls(data, uploadsPublicBase() || '/neu');
      }
      if (key === 'virtual tour') {
        data = rewriteVirtualTourUploadUrls(data, uploadsPublicBase() || '/neu');
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
          rewriteGalleryUploadUrls(payload, uploadsPublicBase() || '/neu') || payload;
      }
      if (key === 'virtual tour') {
        payload =
          rewriteVirtualTourUploadUrls(payload, uploadsPublicBase() || '/neu') || payload;
      }
      const data = await replaceFn(payload);
      res.json({
        data:
          key === 'gallery'
            ? rewriteGalleryUploadUrls(data, uploadsPublicBase() || '/neu')
            : key === 'virtual tour'
              ? rewriteVirtualTourUploadUrls(data, uploadsPublicBase() || '/neu')
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
singletonRoute('/api/home-sections', fetchHomeSections, replaceHomeSections, 'home sections');

/** Store one CMS image on disk; returns a short /uploads URL (avoids huge JSON payloads). */
app.post('/api/uploads', requireCmsAuth, async (req, res) => {
  try {
    const dataUrl = typeof req.body?.dataUrl === 'string' ? req.body.dataUrl : '';
    if (!dataUrl.startsWith('data:image/')) {
      res.status(400).json({ error: 'dataUrl (image data URL) is required' });
      return;
    }
    const saved = saveDataUrlImage(dataUrl);
    const base = uploadsPublicBase();
    res.status(201).json({
      url: `${base}${saved.url}`,
      filename: saved.filename,
    });
  } catch (err) {
    sendError(res, err, 'Failed to upload image');
  }
});

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

app.listen(port, host, () => {
  const mssql = getMssqlDiagnostics();
  console.log(`SGN API listening on http://${host}:${port}`);
  console.log(
    'CMS tables: menu, notices, hero-slides, announcements, blog, school-info, admissions, contact, about, gallery, virtual-tour, pages, home-sections, alumni'
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
