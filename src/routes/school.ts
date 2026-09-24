import { Router } from 'express';
import { getPool, sql } from '../config/db';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const pool = await getPool();
    const result = await pool
      .request()
      .query(`SELECT SettingKey, SettingValue FROM dbo.SchoolSettings ORDER BY SettingKey`);

    const settings: Record<string, string | null> = {};
    for (const row of result.recordset) {
      settings[row.SettingKey] = row.SettingValue;
    }

    res.json({ success: true, data: settings });
  })
);

router.put(
  '/',
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, string>;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new AppError('Body must be an object of key/value settings', 400);
    }

    const pool = await getPool();
    for (const [key, value] of Object.entries(body)) {
      await pool
        .request()
        .input('key', sql.NVarChar, key)
        .input('value', sql.NVarChar, value == null ? null : String(value))
        .query(`
          MERGE dbo.SchoolSettings AS t
          USING (SELECT @key AS SettingKey) AS s ON t.SettingKey = s.SettingKey
          WHEN MATCHED THEN UPDATE SET SettingValue = @value, UpdatedAt = SYSUTCDATETIME()
          WHEN NOT MATCHED THEN INSERT (SettingKey, SettingValue) VALUES (@key, @value);
        `);
    }

    res.json({ success: true, message: 'Settings updated' });
  })
);

export default router;
