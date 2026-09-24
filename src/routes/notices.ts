import { Router } from 'express';
import { getPool, sql } from '../config/db';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

function mapNotice(row: Record<string, unknown>) {
  return {
    id: row.Id,
    refNo: row.RefNo,
    title: row.Title,
    category: row.Category,
    date: row.NoticeDate,
    isImportant: Boolean(row.IsImportant),
    targetAudience: row.TargetAudience,
    summary: row.Summary,
    fullContent: row.FullContent,
    signedBy: row.SignedBy,
    designation: row.Designation,
    attachmentName: row.AttachmentName,
    attachmentSize: row.AttachmentSize,
    isPublished: Boolean(row.IsPublished),
    sortOrder: row.SortOrder,
    createdAt: row.CreatedAt,
    updatedAt: row.UpdatedAt,
  };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const publishedOnly = req.query.all !== 'true';
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT * FROM dbo.Notices
      ${publishedOnly ? 'WHERE IsPublished = 1' : ''}
      ORDER BY NoticeDate DESC, SortOrder ASC
    `);
    res.json({ success: true, data: result.recordset.map(mapNotice) });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.NVarChar, req.params.id)
      .query(`SELECT * FROM dbo.Notices WHERE Id = @id`);

    if (!result.recordset[0]) throw new AppError('Notice not found', 404);
    res.json({ success: true, data: mapNotice(result.recordset[0]) });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body;
    if (!b?.id || !b?.refNo || !b?.title || !b?.category || !b?.date) {
      throw new AppError('id, refNo, title, category, and date are required', 400);
    }

    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.NVarChar, b.id)
      .input('refNo', sql.NVarChar, b.refNo)
      .input('title', sql.NVarChar, b.title)
      .input('category', sql.NVarChar, b.category)
      .input('date', sql.Date, b.date)
      .input('isImportant', sql.Bit, b.isImportant ? 1 : 0)
      .input('targetAudience', sql.NVarChar, b.targetAudience ?? null)
      .input('summary', sql.NVarChar, b.summary ?? null)
      .input('fullContent', sql.NVarChar, b.fullContent ?? null)
      .input('signedBy', sql.NVarChar, b.signedBy ?? null)
      .input('designation', sql.NVarChar, b.designation ?? null)
      .input('attachmentName', sql.NVarChar, b.attachmentName ?? null)
      .input('attachmentSize', sql.NVarChar, b.attachmentSize ?? null)
      .input('isPublished', sql.Bit, b.isPublished === false ? 0 : 1)
      .input('sortOrder', sql.Int, b.sortOrder ?? 0)
      .query(`
        INSERT INTO dbo.Notices (
          Id, RefNo, Title, Category, NoticeDate, IsImportant, TargetAudience,
          Summary, FullContent, SignedBy, Designation, AttachmentName, AttachmentSize,
          IsPublished, SortOrder
        ) VALUES (
          @id, @refNo, @title, @category, @date, @isImportant, @targetAudience,
          @summary, @fullContent, @signedBy, @designation, @attachmentName, @attachmentSize,
          @isPublished, @sortOrder
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
      .input('refNo', sql.NVarChar, b.refNo)
      .input('title', sql.NVarChar, b.title)
      .input('category', sql.NVarChar, b.category)
      .input('date', sql.Date, b.date)
      .input('isImportant', sql.Bit, b.isImportant ? 1 : 0)
      .input('targetAudience', sql.NVarChar, b.targetAudience ?? null)
      .input('summary', sql.NVarChar, b.summary ?? null)
      .input('fullContent', sql.NVarChar, b.fullContent ?? null)
      .input('signedBy', sql.NVarChar, b.signedBy ?? null)
      .input('designation', sql.NVarChar, b.designation ?? null)
      .input('attachmentName', sql.NVarChar, b.attachmentName ?? null)
      .input('attachmentSize', sql.NVarChar, b.attachmentSize ?? null)
      .input('isPublished', sql.Bit, b.isPublished === false ? 0 : 1)
      .input('sortOrder', sql.Int, b.sortOrder ?? 0)
      .query(`
        UPDATE dbo.Notices SET
          RefNo = @refNo, Title = @title, Category = @category, NoticeDate = @date,
          IsImportant = @isImportant, TargetAudience = @targetAudience, Summary = @summary,
          FullContent = @fullContent, SignedBy = @signedBy, Designation = @designation,
          AttachmentName = @attachmentName, AttachmentSize = @attachmentSize,
          IsPublished = @isPublished, SortOrder = @sortOrder, UpdatedAt = SYSUTCDATETIME()
        WHERE Id = @id
      `);

    if (result.rowsAffected[0] === 0) throw new AppError('Notice not found', 404);
    res.json({ success: true, message: 'Notice updated' });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.NVarChar, req.params.id)
      .query(`DELETE FROM dbo.Notices WHERE Id = @id`);

    if (result.rowsAffected[0] === 0) throw new AppError('Notice not found', 404);
    res.json({ success: true, message: 'Notice deleted' });
  })
);

export default router;
