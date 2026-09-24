import { Router } from 'express';
import { getPool, sql } from '../config/db';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const activeOnly = req.query.all !== 'true';
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT * FROM dbo.Banners
      ${activeOnly ? 'WHERE IsActive = 1' : ''}
      ORDER BY SortOrder ASC, Id ASC
    `);
    res.json({
      success: true,
      data: result.recordset.map((row) => ({
        id: row.Id,
        title: row.Title,
        subtitle: row.Subtitle,
        imageUrl: row.ImageUrl,
        ctaText: row.CtaText,
        ctaLink: row.CtaLink,
        badgeText: row.BadgeText,
        sortOrder: row.SortOrder,
        isActive: Boolean(row.IsActive),
      })),
    });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body;
    const pool = await getPool();
    const result = await pool
      .request()
      .input('title', sql.NVarChar, b.title ?? null)
      .input('subtitle', sql.NVarChar, b.subtitle ?? null)
      .input('imageUrl', sql.NVarChar, b.imageUrl ?? null)
      .input('ctaText', sql.NVarChar, b.ctaText ?? null)
      .input('ctaLink', sql.NVarChar, b.ctaLink ?? null)
      .input('badgeText', sql.NVarChar, b.badgeText ?? null)
      .input('sortOrder', sql.Int, b.sortOrder ?? 0)
      .input('isActive', sql.Bit, b.isActive === false ? 0 : 1)
      .query(`
        INSERT INTO dbo.Banners (
          Title, Subtitle, ImageUrl, CtaText, CtaLink, BadgeText, SortOrder, IsActive
        )
        OUTPUT INSERTED.Id
        VALUES (
          @title, @subtitle, @imageUrl, @ctaText, @ctaLink, @badgeText, @sortOrder, @isActive
        )
      `);
    res.status(201).json({ success: true, data: { id: result.recordset[0].Id } });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const b = req.body;
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, Number(req.params.id))
      .input('title', sql.NVarChar, b.title ?? null)
      .input('subtitle', sql.NVarChar, b.subtitle ?? null)
      .input('imageUrl', sql.NVarChar, b.imageUrl ?? null)
      .input('ctaText', sql.NVarChar, b.ctaText ?? null)
      .input('ctaLink', sql.NVarChar, b.ctaLink ?? null)
      .input('badgeText', sql.NVarChar, b.badgeText ?? null)
      .input('sortOrder', sql.Int, b.sortOrder ?? 0)
      .input('isActive', sql.Bit, b.isActive === false ? 0 : 1)
      .query(`
        UPDATE dbo.Banners SET
          Title = @title, Subtitle = @subtitle, ImageUrl = @imageUrl,
          CtaText = @ctaText, CtaLink = @ctaLink, BadgeText = @badgeText,
          SortOrder = @sortOrder, IsActive = @isActive, UpdatedAt = SYSUTCDATETIME()
        WHERE Id = @id
      `);
    if (result.rowsAffected[0] === 0) throw new AppError('Banner not found', 404);
    res.json({ success: true, message: 'Banner updated' });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, Number(req.params.id))
      .query(`DELETE FROM dbo.Banners WHERE Id = @id`);
    if (result.rowsAffected[0] === 0) throw new AppError('Banner not found', 404);
    res.json({ success: true, message: 'Banner deleted' });
  })
);

export default router;
