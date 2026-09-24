import { Router } from 'express';
import { getPool, sql } from '../config/db';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { parseJsonColumn, toJson } from '../utils/json';

const router = Router();

function mapPost(row: Record<string, unknown>) {
  return {
    id: row.Id,
    title: row.Title,
    slug: row.Slug,
    category: row.Category,
    author: row.Author,
    authorRole: row.AuthorRole,
    authorAvatar: row.AuthorAvatar,
    date: row.PublishDate,
    readTime: row.ReadTime,
    coverImage: row.CoverImage,
    summary: row.Summary,
    content: parseJsonColumn<string[]>(row.ContentJson, []),
    tags: parseJsonColumn<string[]>(row.TagsJson, []),
    isPublished: Boolean(row.IsPublished),
    sortOrder: row.SortOrder,
  };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const publishedOnly = req.query.all !== 'true';
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT * FROM dbo.BlogPosts
      ${publishedOnly ? 'WHERE IsPublished = 1' : ''}
      ORDER BY PublishDate DESC, SortOrder ASC
    `);
    res.json({ success: true, data: result.recordset.map(mapPost) });
  })
);

router.get(
  '/slug/:slug',
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('slug', sql.NVarChar, req.params.slug)
      .query(`SELECT * FROM dbo.BlogPosts WHERE Slug = @slug`);
    if (!result.recordset[0]) throw new AppError('Blog post not found', 404);
    res.json({ success: true, data: mapPost(result.recordset[0]) });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.NVarChar, req.params.id)
      .query(`SELECT * FROM dbo.BlogPosts WHERE Id = @id`);
    if (!result.recordset[0]) throw new AppError('Blog post not found', 404);
    res.json({ success: true, data: mapPost(result.recordset[0]) });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body;
    if (!b?.id || !b?.title || !b?.slug) {
      throw new AppError('id, title, and slug are required', 400);
    }
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.NVarChar, b.id)
      .input('title', sql.NVarChar, b.title)
      .input('slug', sql.NVarChar, b.slug)
      .input('category', sql.NVarChar, b.category ?? null)
      .input('author', sql.NVarChar, b.author ?? null)
      .input('authorRole', sql.NVarChar, b.authorRole ?? null)
      .input('authorAvatar', sql.NVarChar, b.authorAvatar ?? null)
      .input('publishDate', sql.Date, b.date ?? null)
      .input('readTime', sql.NVarChar, b.readTime ?? null)
      .input('coverImage', sql.NVarChar, b.coverImage ?? null)
      .input('summary', sql.NVarChar, b.summary ?? null)
      .input('content', sql.NVarChar, toJson(b.content ?? []))
      .input('tags', sql.NVarChar, toJson(b.tags ?? []))
      .input('isPublished', sql.Bit, b.isPublished === false ? 0 : 1)
      .input('sortOrder', sql.Int, b.sortOrder ?? 0)
      .query(`
        INSERT INTO dbo.BlogPosts (
          Id, Title, Slug, Category, Author, AuthorRole, AuthorAvatar, PublishDate,
          ReadTime, CoverImage, Summary, ContentJson, TagsJson, IsPublished, SortOrder
        ) VALUES (
          @id, @title, @slug, @category, @author, @authorRole, @authorAvatar, @publishDate,
          @readTime, @coverImage, @summary, @content, @tags, @isPublished, @sortOrder
        )
      `);
    res.status(201).json({ success: true, data: { id: b.id } });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const b = req.body;
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.NVarChar, req.params.id)
      .input('title', sql.NVarChar, b.title)
      .input('slug', sql.NVarChar, b.slug)
      .input('category', sql.NVarChar, b.category ?? null)
      .input('author', sql.NVarChar, b.author ?? null)
      .input('authorRole', sql.NVarChar, b.authorRole ?? null)
      .input('authorAvatar', sql.NVarChar, b.authorAvatar ?? null)
      .input('publishDate', sql.Date, b.date ?? null)
      .input('readTime', sql.NVarChar, b.readTime ?? null)
      .input('coverImage', sql.NVarChar, b.coverImage ?? null)
      .input('summary', sql.NVarChar, b.summary ?? null)
      .input('content', sql.NVarChar, toJson(b.content ?? []))
      .input('tags', sql.NVarChar, toJson(b.tags ?? []))
      .input('isPublished', sql.Bit, b.isPublished === false ? 0 : 1)
      .input('sortOrder', sql.Int, b.sortOrder ?? 0)
      .query(`
        UPDATE dbo.BlogPosts SET
          Title = @title, Slug = @slug, Category = @category, Author = @author,
          AuthorRole = @authorRole, AuthorAvatar = @authorAvatar, PublishDate = @publishDate,
          ReadTime = @readTime, CoverImage = @coverImage, Summary = @summary,
          ContentJson = @content, TagsJson = @tags, IsPublished = @isPublished,
          SortOrder = @sortOrder, UpdatedAt = SYSUTCDATETIME()
        WHERE Id = @id
      `);
    if (result.rowsAffected[0] === 0) throw new AppError('Blog post not found', 404);
    res.json({ success: true, message: 'Blog post updated' });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.NVarChar, req.params.id)
      .query(`DELETE FROM dbo.BlogPosts WHERE Id = @id`);
    if (result.rowsAffected[0] === 0) throw new AppError('Blog post not found', 404);
    res.json({ success: true, message: 'Blog post deleted' });
  })
);

export default router;
