import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATA_URL_RE = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/;
const PDF_DATA_URL_RE = /^data:application\/pdf;base64,(.+)$/i;

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const MAX_PDF_BYTES = 25 * 1024 * 1024;

/**
 * CMS images must land in the IIS site uploads folder so the website can serve
 * https://app.shantigyanniketan.org/uploads/… as static files.
 *
 * Production (API on Ubuntu): mount the IIS uploads share, then set:
 *   UPLOADS_DIR=/mnt/sgn-iis-uploads
 *
 * Production (API on Windows): set directly, e.g.:
 *   UPLOADS_DIR=C:\inetpub\wwwroot\app.shantigyanniketan.org\uploads
 */
export function resolveUploadsDir(): string {
  const fromEnv = process.env.UPLOADS_DIR?.trim();
  if (fromEnv) return path.resolve(fromEnv);

  if (process.platform === 'win32') {
    const candidates = [
      'C:\\inetpub\\wwwroot\\app.shantigyanniketan.org\\uploads',
      'C:\\inetpub\\wwwroot\\shantigyanniketan.org\\app\\uploads',
      'C:\\inetpub\\wwwroot\\shantigyanniketan.org\\neu\\uploads',
    ];
    for (const dir of candidates) {
      const parent = path.dirname(dir);
      if (fs.existsSync(parent)) return dir;
    }
  }

  // Local Mac/Linux dev fallback (Vite proxies /uploads → this folder)
  return path.resolve(__dirname, '../uploads');
}

let cachedUploadsDir: string | null = null;

export function getUploadsDir(): string {
  if (!cachedUploadsDir) cachedUploadsDir = resolveUploadsDir();
  return cachedUploadsDir;
}

/** @deprecated use getUploadsDir() after loadEnv() */
export const uploadsDir = path.resolve(__dirname, '../uploads');

export function ensureUploadsDir(): void {
  const dir = getUploadsDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function listUploadedFiles(): string[] {
  ensureUploadsDir();
  return fs
    .readdirSync(getUploadsDir())
    .filter((name) => /\.(jpe?g|png|webp|gif|pdf)$/i.test(name));
}

function sanitizeUploadBasename(name: string | undefined | null): string {
  const raw = (name || '').trim().replace(/\\/g, '/').split('/').pop() || '';
  // Keep the original display name; strip only path/unsafe filesystem characters
  const safe = raw
    .replace(/[<>:"|?*\x00-\x1f]/g, '')
    .replace(/^\.+/, '')
    .trim()
    .slice(0, 120);
  return safe || 'document.pdf';
}

export function savePdfBuffer(
  buffer: Buffer,
  originalName?: string | null
): { url: string; filename: string } {
  if (!buffer?.length) {
    throw new Error('PDF file is empty.');
  }
  if (buffer.length > MAX_PDF_BYTES) {
    throw new Error('PDF is too large (max 25 MB).');
  }
  // %PDF magic
  const head = buffer.subarray(0, 5).toString('utf8');
  if (!head.startsWith('%PDF')) {
    throw new Error('File does not look like a PDF. Please upload a .pdf file.');
  }

  ensureUploadsDir();
  const base = sanitizeUploadBasename(originalName);
  const withExt = /\.pdf$/i.test(base) ? base : `${base}.pdf`;
  // Keep the original filename; only suffix -2, -3… if that name already exists
  let filename = withExt;
  const dir = getUploadsDir();
  if (fs.existsSync(path.join(dir, filename))) {
    const stem = withExt.replace(/\.pdf$/i, '');
    let n = 2;
    while (fs.existsSync(path.join(dir, `${stem}-${n}.pdf`))) n += 1;
    filename = `${stem}-${n}.pdf`;
  }
  fs.writeFileSync(path.join(dir, filename), buffer);
  return { url: `/uploads/${filename}`, filename };
}

export function saveDataUrlPdf(dataUrl: string, originalName?: string | null): {
  url: string;
  filename: string;
} {
  const match = PDF_DATA_URL_RE.exec(dataUrl.trim());
  if (!match) {
    throw new Error('Invalid PDF data. Upload a PDF file.');
  }
  const buffer = Buffer.from(match[1], 'base64');
  return savePdfBuffer(buffer, originalName);
}

export function saveDataUrlImage(dataUrl: string): { url: string; filename: string } {
  const match = DATA_URL_RE.exec(dataUrl.trim());
  if (!match) {
    throw new Error('Invalid image data. Upload a JPG, PNG, WebP, or GIF.');
  }
  const mime = match[1].toLowerCase();
  const ext = EXT_BY_MIME[mime];
  if (!ext) {
    throw new Error('Unsupported image type. Use JPG, PNG, WebP, or GIF.');
  }
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > 8 * 1024 * 1024) {
    throw new Error('Image is too large after processing (max 8 MB).');
  }
  ensureUploadsDir();
  const filename = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  fs.writeFileSync(path.join(getUploadsDir(), filename), buffer);
  // Always website-relative — IIS serves /uploads from the site folder
  return { url: `/uploads/${filename}`, filename };
}

function normalizeUploadPublicUrl(url: string, publicBase: string): string {
  let u = url.trim();
  if (!u) return u;

  // Absolute api.* upload links → website-relative
  if (u.startsWith('http://') || u.startsWith('https://')) {
    try {
      const parsed = new URL(u);
      u = parsed.pathname;
    } catch {
      return u;
    }
  }

  if (u === '/neu') u = '/';
  else if (u.startsWith('/neu/')) u = u.slice(4) || '/';

  if (u.startsWith('/uploads/')) {
    return publicBase ? `${publicBase}${u}` : u;
  }
  return u;
}

/** Rewrite gallery image URLs for the public site base ('' = root). */
export function rewriteGalleryUploadUrls(
  payload: Record<string, unknown> | null,
  publicBase = ''
): Record<string, unknown> | null {
  if (!payload) return null;
  const base = (publicBase || '').replace(/\/$/, '');

  const fix = (url: unknown): unknown => {
    if (typeof url !== 'string' || !url) return url;
    return normalizeUploadPublicUrl(url, base);
  };

  const albums = Array.isArray(payload.albums)
    ? payload.albums.map((album) => {
        if (!album || typeof album !== 'object') return album;
        const a = album as Record<string, unknown>;
        const photos = Array.isArray(a.photos)
          ? a.photos.map((photo) => {
              if (!photo || typeof photo !== 'object') return photo;
              const p = photo as Record<string, unknown>;
              return { ...p, imageUrl: fix(p.imageUrl) };
            })
          : a.photos;
        return { ...a, photos };
      })
    : payload.albums;

  const videos = Array.isArray(payload.videos)
    ? payload.videos.map((video) => {
        if (!video || typeof video !== 'object') return video;
        const v = video as Record<string, unknown>;
        return { ...v, thumbnailUrl: fix(v.thumbnailUrl) };
      })
    : payload.videos;

  return { ...payload, albums, videos };
}

export function rewriteVirtualTourUploadUrls(
  payload: Record<string, unknown> | null,
  publicBase = ''
): Record<string, unknown> | null {
  if (!payload) return null;
  const base = (publicBase || '').replace(/\/$/, '');

  const fix = (url: unknown): unknown => {
    if (typeof url !== 'string' || !url) return url;
    return normalizeUploadPublicUrl(url, base);
  };

  const spots = Array.isArray(payload.spots)
    ? payload.spots.map((spot) => {
        if (!spot || typeof spot !== 'object') return spot;
        const s = spot as Record<string, unknown>;
        return { ...s, imageUrl: fix(s.imageUrl) };
      })
    : payload.spots;

  return { ...payload, spots };
}
