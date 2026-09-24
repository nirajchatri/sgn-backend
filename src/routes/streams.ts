import { Router } from 'express';
import { getPool, sql } from '../config/db';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { parseJsonColumn, toJson } from '../utils/json';

const router = Router();

function mapStream(row: Record<string, unknown>) {
  return {
    id: row.Id,
    code: row.Code,
    name: row.Name,
    compulsorySubjects: parseJsonColumn<string[]>(row.CompulsorySubjectsJson, []),
    electiveSubjects: parseJsonColumn<string[]>(row.ElectiveSubjectsJson, []),
    careerProspects: parseJsonColumn<string[]>(row.CareerProspectsJson, []),
    sortOrder: row.SortOrder,
    isPublished: Boolean(row.IsPublished),
  };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const publishedOnly = req.query.all !== 'true';
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT * FROM dbo.SeniorStreams
      ${publishedOnly ? 'WHERE IsPublished = 1' : ''}
      ORDER BY SortOrder ASC
    `);
    res.json({ success: true, data: result.recordset.map(mapStream) });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body;
    if (!b?.code || !b?.name) throw new AppError('code and name are required', 400);
    const pool = await getPool();
    const result = await pool
      .request()
      .input('code', sql.NVarChar, b.code)
      .input('name', sql.NVarChar, b.name)
      .input('compulsory', sql.NVarChar, toJson(b.compulsorySubjects ?? []))
      .input('elective', sql.NVarChar, toJson(b.electiveSubjects ?? []))
      .input('careers', sql.NVarChar, toJson(b.careerProspects ?? []))
      .input('sortOrder', sql.Int, b.sortOrder ?? 0)
      .input('isPublished', sql.Bit, b.isPublished === false ? 0 : 1)
      .query(`
        INSERT INTO dbo.SeniorStreams (
          Code, Name, CompulsorySubjectsJson, ElectiveSubjectsJson,
          CareerProspectsJson, SortOrder, IsPublished
        )
        OUTPUT INSERTED.Id
        VALUES (@code, @name, @compulsory, @elective, @careers, @sortOrder, @isPublished)
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
      .input('code', sql.NVarChar, b.code)
      .input('name', sql.NVarChar, b.name)
      .input('compulsory', sql.NVarChar, toJson(b.compulsorySubjects ?? []))
      .input('elective', sql.NVarChar, toJson(b.electiveSubjects ?? []))
      .input('careers', sql.NVarChar, toJson(b.careerProspects ?? []))
      .input('sortOrder', sql.Int, b.sortOrder ?? 0)
      .input('isPublished', sql.Bit, b.isPublished === false ? 0 : 1)
      .query(`
        UPDATE dbo.SeniorStreams SET
          Code = @code, Name = @name, CompulsorySubjectsJson = @compulsory,
          ElectiveSubjectsJson = @elective, CareerProspectsJson = @careers,
          SortOrder = @sortOrder, IsPublished = @isPublished, UpdatedAt = SYSUTCDATETIME()
        WHERE Id = @id
      `);
    if (result.rowsAffected[0] === 0) throw new AppError('Stream not found', 404);
    res.json({ success: true, message: 'Stream updated' });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, Number(req.params.id))
      .query(`DELETE FROM dbo.SeniorStreams WHERE Id = @id`);
    if (result.rowsAffected[0] === 0) throw new AppError('Stream not found', 404);
    res.json({ success: true, message: 'Stream deleted' });
  })
);

export default router;
