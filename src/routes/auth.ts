import { Router } from 'express';
import { getPool, sql } from '../config/db';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

function verifyPassword(storedHash: string, password: string): boolean {
  try {
    const decoded = Buffer.from(storedHash, 'base64').toString('utf8');
    if (decoded.startsWith('sgn:')) {
      return decoded.slice(4) === password;
    }
  } catch {
    /* fall through */
  }
  return storedHash === password;
}

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };

    if (!username?.trim() || !password) {
      throw new AppError('Username and password are required', 400);
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('username', sql.NVarChar, username.trim())
      .query(`
        SELECT TOP 1 Id, Username, PasswordHash, DisplayName, IsActive
        FROM dbo.CmsUsers
        WHERE Username = @username
      `);

    const user = result.recordset[0];
    if (!user || !user.IsActive || !verifyPassword(user.PasswordHash, password)) {
      throw new AppError('Invalid credentials', 401);
    }

    await pool
      .request()
      .input('id', sql.Int, user.Id)
      .query(`UPDATE dbo.CmsUsers SET LastLoginAt = SYSUTCDATETIME() WHERE Id = @id`);

    res.json({
      success: true,
      data: {
        id: user.Id,
        username: user.Username,
        displayName: user.DisplayName,
        loggedInAt: new Date().toISOString(),
      },
    });
  })
);

export default router;
