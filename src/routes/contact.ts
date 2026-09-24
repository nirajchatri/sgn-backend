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
      .query(`SELECT * FROM dbo.ContactMessages ORDER BY CreatedAt DESC`);
    res.json({ success: true, data: result.recordset });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body;
    if (!b?.name || !b?.message) {
      throw new AppError('name and message are required', 400);
    }
    const pool = await getPool();
    const result = await pool
      .request()
      .input('name', sql.NVarChar, b.name)
      .input('email', sql.NVarChar, b.email ?? null)
      .input('phone', sql.NVarChar, b.phone ?? null)
      .input('subject', sql.NVarChar, b.subject ?? null)
      .input('message', sql.NVarChar, b.message)
      .query(`
        INSERT INTO dbo.ContactMessages (Name, Email, Phone, Subject, Message)
        OUTPUT INSERTED.Id, INSERTED.CreatedAt
        VALUES (@name, @email, @phone, @subject, @message)
      `);
    res.status(201).json({ success: true, data: result.recordset[0] });
  })
);

export default router;
