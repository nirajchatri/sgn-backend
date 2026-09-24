import { Router } from 'express';
import { getPool, sql } from '../config/db';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { parseJsonColumn, toJson } from '../utils/json';

const router = Router();

function mapFacility(row: Record<string, unknown>) {
  return {
    id: row.Id,
    name: row.Name,
    category: row.Category,
    shortDesc: row.ShortDesc,
    fullDesc: row.FullDesc,
    features: parseJsonColumn<string[]>(row.FeaturesJson, []),
    imageUrl: row.ImageUrl,
    specifications: parseJsonColumn<Record<string, string>>(row.SpecsJson, {}),
    timings: row.Timings,
    inCharge: row.InCharge,
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
      SELECT * FROM dbo.Facilities
      ${publishedOnly ? 'WHERE IsPublished = 1' : ''}
      ORDER BY SortOrder ASC, Name ASC
    `);
    res.json({ success: true, data: result.recordset.map(mapFacility) });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.NVarChar, req.params.id)
      .query(`SELECT * FROM dbo.Facilities WHERE Id = @id`);
    if (!result.recordset[0]) throw new AppError('Facility not found', 404);
    res.json({ success: true, data: mapFacility(result.recordset[0]) });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body;
    if (!b?.id || !b?.name || !b?.category) {
      throw new AppError('id, name, and category are required', 400);
    }
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.NVarChar, b.id)
      .input('name', sql.NVarChar, b.name)
      .input('category', sql.NVarChar, b.category)
      .input('shortDesc', sql.NVarChar, b.shortDesc ?? null)
      .input('fullDesc', sql.NVarChar, b.fullDesc ?? null)
      .input('features', sql.NVarChar, toJson(b.features ?? []))
      .input('imageUrl', sql.NVarChar, b.imageUrl ?? null)
      .input('specs', sql.NVarChar, toJson(b.specifications ?? {}))
      .input('timings', sql.NVarChar, b.timings ?? null)
      .input('inCharge', sql.NVarChar, b.inCharge ?? null)
      .input('isPublished', sql.Bit, b.isPublished === false ? 0 : 1)
      .input('sortOrder', sql.Int, b.sortOrder ?? 0)
      .query(`
        INSERT INTO dbo.Facilities (
          Id, Name, Category, ShortDesc, FullDesc, FeaturesJson, ImageUrl,
          SpecsJson, Timings, InCharge, IsPublished, SortOrder
        ) VALUES (
          @id, @name, @category, @shortDesc, @fullDesc, @features, @imageUrl,
          @specs, @timings, @inCharge, @isPublished, @sortOrder
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
      .input('name', sql.NVarChar, b.name)
      .input('category', sql.NVarChar, b.category)
      .input('shortDesc', sql.NVarChar, b.shortDesc ?? null)
      .input('fullDesc', sql.NVarChar, b.fullDesc ?? null)
      .input('features', sql.NVarChar, toJson(b.features ?? []))
      .input('imageUrl', sql.NVarChar, b.imageUrl ?? null)
      .input('specs', sql.NVarChar, toJson(b.specifications ?? {}))
      .input('timings', sql.NVarChar, b.timings ?? null)
      .input('inCharge', sql.NVarChar, b.inCharge ?? null)
      .input('isPublished', sql.Bit, b.isPublished === false ? 0 : 1)
      .input('sortOrder', sql.Int, b.sortOrder ?? 0)
      .query(`
        UPDATE dbo.Facilities SET
          Name = @name, Category = @category, ShortDesc = @shortDesc, FullDesc = @fullDesc,
          FeaturesJson = @features, ImageUrl = @imageUrl, SpecsJson = @specs,
          Timings = @timings, InCharge = @inCharge, IsPublished = @isPublished,
          SortOrder = @sortOrder, UpdatedAt = SYSUTCDATETIME()
        WHERE Id = @id
      `);
    if (result.rowsAffected[0] === 0) throw new AppError('Facility not found', 404);
    res.json({ success: true, message: 'Facility updated' });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.NVarChar, req.params.id)
      .query(`DELETE FROM dbo.Facilities WHERE Id = @id`);
    if (result.rowsAffected[0] === 0) throw new AppError('Facility not found', 404);
    res.json({ success: true, message: 'Facility deleted' });
  })
);

export default router;
