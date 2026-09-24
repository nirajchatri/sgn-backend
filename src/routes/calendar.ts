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
      SELECT * FROM dbo.AcademicCalendar
      ${publishedOnly ? 'WHERE IsPublished = 1' : ''}
      ORDER BY SortOrder ASC, Id ASC
    `);
    res.json({
      success: true,
      data: result.recordset.map((row) => ({
        id: row.Id,
        term: row.Term,
        duration: row.Duration,
        events: row.Events,
        academicYear: row.AcademicYear,
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
    if (!b?.term) throw new AppError('term is required', 400);
    const pool = await getPool();
    const result = await pool
      .request()
      .input('term', sql.NVarChar, b.term)
      .input('duration', sql.NVarChar, b.duration ?? null)
      .input('events', sql.NVarChar, b.events ?? null)
      .input('academicYear', sql.NVarChar, b.academicYear ?? null)
      .input('sortOrder', sql.Int, b.sortOrder ?? 0)
      .input('isPublished', sql.Bit, b.isPublished === false ? 0 : 1)
      .query(`
        INSERT INTO dbo.AcademicCalendar (Term, Duration, Events, AcademicYear, SortOrder, IsPublished)
        OUTPUT INSERTED.Id
        VALUES (@term, @duration, @events, @academicYear, @sortOrder, @isPublished)
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
      .query(`DELETE FROM dbo.AcademicCalendar WHERE Id = @id`);
    if (result.rowsAffected[0] === 0) throw new AppError('Calendar entry not found', 404);
    res.json({ success: true, message: 'Calendar entry deleted' });
  })
);

export default router;
