import { Router } from 'express';
import { getPool, sql } from '../config/db';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

function mapHouse(row: Record<string, unknown>) {
  return {
    id: row.Id,
    name: row.Name,
    color: row.Color,
    motto: row.Motto,
    element: row.Element,
    captain: row.Captain,
    viceCaptain: row.ViceCaptain,
    points: row.Points,
    trophiesWon: row.TrophiesWon,
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
      SELECT * FROM dbo.Houses
      ${publishedOnly ? 'WHERE IsPublished = 1' : ''}
      ORDER BY SortOrder ASC, Name ASC
    `);
    res.json({ success: true, data: result.recordset.map(mapHouse) });
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
      .input('color', sql.NVarChar, b.color ?? null)
      .input('motto', sql.NVarChar, b.motto ?? null)
      .input('element', sql.NVarChar, b.element ?? null)
      .input('captain', sql.NVarChar, b.captain ?? null)
      .input('viceCaptain', sql.NVarChar, b.viceCaptain ?? null)
      .input('points', sql.Int, b.points ?? 0)
      .input('trophiesWon', sql.Int, b.trophiesWon ?? 0)
      .input('sortOrder', sql.Int, b.sortOrder ?? 0)
      .input('isPublished', sql.Bit, b.isPublished === false ? 0 : 1)
      .query(`
        INSERT INTO dbo.Houses (
          Name, Color, Motto, Element, Captain, ViceCaptain, Points, TrophiesWon, SortOrder, IsPublished
        )
        OUTPUT INSERTED.Id
        VALUES (
          @name, @color, @motto, @element, @captain, @viceCaptain, @points, @trophiesWon, @sortOrder, @isPublished
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
      .input('color', sql.NVarChar, b.color ?? null)
      .input('motto', sql.NVarChar, b.motto ?? null)
      .input('element', sql.NVarChar, b.element ?? null)
      .input('captain', sql.NVarChar, b.captain ?? null)
      .input('viceCaptain', sql.NVarChar, b.viceCaptain ?? null)
      .input('points', sql.Int, b.points ?? 0)
      .input('trophiesWon', sql.Int, b.trophiesWon ?? 0)
      .input('sortOrder', sql.Int, b.sortOrder ?? 0)
      .input('isPublished', sql.Bit, b.isPublished === false ? 0 : 1)
      .query(`
        UPDATE dbo.Houses SET
          Name = @name, Color = @color, Motto = @motto, Element = @element,
          Captain = @captain, ViceCaptain = @viceCaptain, Points = @points,
          TrophiesWon = @trophiesWon, SortOrder = @sortOrder, IsPublished = @isPublished,
          UpdatedAt = SYSUTCDATETIME()
        WHERE Id = @id
      `);
    if (result.rowsAffected[0] === 0) throw new AppError('House not found', 404);
    res.json({ success: true, message: 'House updated' });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, Number(req.params.id))
      .query(`DELETE FROM dbo.Houses WHERE Id = @id`);
    if (result.rowsAffected[0] === 0) throw new AppError('House not found', 404);
    res.json({ success: true, message: 'House deleted' });
  })
);

export default router;
