import { Router } from 'express';
import { getPool } from '../config/db';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    let dbOk = false;
    let dbError: string | null = null;

    try {
      const pool = await getPool();
      await pool.request().query('SELECT 1 AS ok');
      dbOk = true;
    } catch (err) {
      dbError = err instanceof Error ? err.message : 'DB connection failed';
    }

    res.json({
      success: true,
      data: {
        service: 'sgn-website-backend',
        status: 'ok',
        database: dbOk ? 'connected' : 'error',
        databaseError: dbError,
        timestamp: new Date().toISOString(),
      },
    });
  })
);

export default router;
