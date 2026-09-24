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
      SELECT * FROM dbo.Announcements
      ${
        activeOnly
          ? `WHERE IsActive = 1
             AND (StartsAt IS NULL OR StartsAt <= SYSUTCDATETIME())
             AND (EndsAt IS NULL OR EndsAt >= SYSUTCDATETIME())`
          : ''
      }
      ORDER BY SortOrder ASC, Id ASC
    `);
    res.json({
      success: true,
      data: result.recordset.map((row) => ({
        id: row.Id,
        message: row.Message,
        linkUrl: row.LinkUrl,
        sortOrder: row.SortOrder,
        isActive: Boolean(row.IsActive),
        startsAt: row.StartsAt,
        endsAt: row.EndsAt,
      })),
    });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body;
    if (!b?.message) throw new AppError('message is required', 400);
    const pool = await getPool();
    const result = await pool
      .request()
      .input('message', sql.NVarChar, b.message)
      .input('linkUrl', sql.NVarChar, b.linkUrl ?? null)
      .input('sortOrder', sql.Int, b.sortOrder ?? 0)
      .input('isActive', sql.Bit, b.isActive === false ? 0 : 1)
      .input('startsAt', sql.DateTime2, b.startsAt ?? null)
      .input('endsAt', sql.DateTime2, b.endsAt ?? null)
      .query(`
        INSERT INTO dbo.Announcements (Message, LinkUrl, SortOrder, IsActive, StartsAt, EndsAt)
        OUTPUT INSERTED.Id
        VALUES (@message, @linkUrl, @sortOrder, @isActive, @startsAt, @endsAt)
      `);
    res.status(201).json({ success: true, data: { id: result.recordset[0].Id } });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, Number(req.params.id))
      .query(`DELETE FROM dbo.Announcements WHERE Id = @id`);
    if (result.rowsAffected[0] === 0) throw new AppError('Announcement not found', 404);
    res.json({ success: true, message: 'Announcement deleted' });
  })
);

export default router;
