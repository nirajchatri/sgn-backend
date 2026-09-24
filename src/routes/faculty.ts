import { Router } from 'express';
import { getPool, sql } from '../config/db';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

function mapFaculty(row: Record<string, unknown>) {
  return {
    id: row.Id,
    name: row.Name,
    designation: row.Designation,
    department: row.Department,
    qualification: row.Qualification,
    experience: row.Experience,
    image: row.ImageUrl,
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
      SELECT * FROM dbo.Faculty
      ${publishedOnly ? 'WHERE IsPublished = 1' : ''}
      ORDER BY SortOrder ASC, Name ASC
    `);
    res.json({ success: true, data: result.recordset.map(mapFaculty) });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body;
    if (!b?.name) throw new AppError('name is required', 400);
    const pool = await getPool();
    const result = await pool
      .request()
      .input('name', sql.NVarChar, b.name)
      .input('designation', sql.NVarChar, b.designation ?? null)
      .input('department', sql.NVarChar, b.department ?? null)
      .input('qualification', sql.NVarChar, b.qualification ?? null)
      .input('experience', sql.NVarChar, b.experience ?? null)
      .input('imageUrl', sql.NVarChar, b.image ?? b.imageUrl ?? null)
      .input('sortOrder', sql.Int, b.sortOrder ?? 0)
      .input('isPublished', sql.Bit, b.isPublished === false ? 0 : 1)
      .query(`
        INSERT INTO dbo.Faculty (
          Name, Designation, Department, Qualification, Experience, ImageUrl, SortOrder, IsPublished
        )
        OUTPUT INSERTED.Id
        VALUES (
          @name, @designation, @department, @qualification, @experience, @imageUrl, @sortOrder, @isPublished
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
      .input('name', sql.NVarChar, b.name)
      .input('designation', sql.NVarChar, b.designation ?? null)
      .input('department', sql.NVarChar, b.department ?? null)
      .input('qualification', sql.NVarChar, b.qualification ?? null)
      .input('experience', sql.NVarChar, b.experience ?? null)
      .input('imageUrl', sql.NVarChar, b.image ?? b.imageUrl ?? null)
      .input('sortOrder', sql.Int, b.sortOrder ?? 0)
      .input('isPublished', sql.Bit, b.isPublished === false ? 0 : 1)
      .query(`
        UPDATE dbo.Faculty SET
          Name = @name, Designation = @designation, Department = @department,
          Qualification = @qualification, Experience = @experience, ImageUrl = @imageUrl,
          SortOrder = @sortOrder, IsPublished = @isPublished, UpdatedAt = SYSUTCDATETIME()
        WHERE Id = @id
      `);
    if (result.rowsAffected[0] === 0) throw new AppError('Faculty member not found', 404);
    res.json({ success: true, message: 'Faculty updated' });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, Number(req.params.id))
      .query(`DELETE FROM dbo.Faculty WHERE Id = @id`);
    if (result.rowsAffected[0] === 0) throw new AppError('Faculty member not found', 404);
    res.json({ success: true, message: 'Faculty deleted' });
  })
);

export default router;
