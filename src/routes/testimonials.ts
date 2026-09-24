import { Router } from 'express';
import { getPool, sql } from '../config/db';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const publishedOnly = req.query.all !== 'true';
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT * FROM dbo.Testimonials
      ${publishedOnly ? 'WHERE IsPublished = 1' : ''}
      ORDER BY SortOrder ASC, Id ASC
    `);
    res.json({
      success: true,
      data: result.recordset.map((row) => ({
        id: row.Id,
        quote: row.Quote,
        name: row.Name,
        designation: row.Designation,
        location: row.Location,
        sortOrder: row.SortOrder,
        isPublished: Boolean(row.IsPublished),
      })),
    });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body;
    if (!b?.quote || !b?.name) throw new AppError('quote and name are required', 400);
    const pool = await getPool();
    const result = await pool
      .request()
      .input('quote', sql.NVarChar, b.quote)
      .input('name', sql.NVarChar, b.name)
      .input('designation', sql.NVarChar, b.designation ?? null)
      .input('location', sql.NVarChar, b.location ?? null)
      .input('sortOrder', sql.Int, b.sortOrder ?? 0)
      .input('isPublished', sql.Bit, b.isPublished === false ? 0 : 1)
      .query(`
        INSERT INTO dbo.Testimonials (Quote, Name, Designation, Location, SortOrder, IsPublished)
        OUTPUT INSERTED.Id
        VALUES (@quote, @name, @designation, @location, @sortOrder, @isPublished)
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
      .query(`DELETE FROM dbo.Testimonials WHERE Id = @id`);
    if (result.rowsAffected[0] === 0) throw new AppError('Testimonial not found', 404);
    res.json({ success: true, message: 'Testimonial deleted' });
  })
);

export default router;
