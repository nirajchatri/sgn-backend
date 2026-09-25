import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATA_URL_RE = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/;

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

/** Prefer IIS static folder so /neu/uploads works without Node proxy. */
export function resolveUploadsDir(): string {
  const fromEnv = process.env.UPLOADS_DIR?.trim();
  if (fromEnv) return path.resolve(fromEnv);

  const iisNeuUploads = 'C:\\inetpub\\wwwroot\\shantigyanniketan.org\\neu\\uploads';
  if (process.platform === 'win32') {
    const neuRoot = 'C:\\inetpub\\wwwroot\\shantigyanniketan.org\\neu';
    if (fs.existsSync(neuRoot)) return iisNeuUploads;
  }

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
    .filter((name) => /\.(jpe?g|png|webp|gif)$/i.test(name));
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
  return { url: `/uploads/${filename}`, filename };
}

/** Ensure gallery / virtual-tour image URLs work under /neu (IIS subdirectory). */
export function rewriteGalleryUploadUrls(
  payload: Record<string, unknown> | null,
  publicBase = '/neu'
): Record<string, unknown> | null {
  if (!payload) return null;
  const base = (publicBase || '/neu').replace(/\/$/, '') || '/neu';

  const fix = (url: unknown): unknown => {
    if (typeof url !== 'string' || !url) return url;
    if (url.startsWith('/uploads/')) return `${base}${url}`;
    return url;
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
  publicBase = '/neu'
): Record<string, unknown> | null {
  if (!payload) return null;
  const base = (publicBase || '/neu').replace(/\/$/, '') || '/neu';

  const fix = (url: unknown): unknown => {
    if (typeof url !== 'string' || !url) return url;
    if (url.startsWith('/uploads/')) return `${base}${url}`;
    return url;
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
