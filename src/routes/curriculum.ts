import { Router } from 'express';
import { getPool, sql } from '../config/db';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { parseJsonColumn, toJson } from '../utils/json';

const router = Router();

function mapStage(row: Record<string, unknown>) {
  return {
    id: row.Id,
    stageName: row.StageName,
    nepPhase: row.NepPhase,
    grades: row.Grades,
    ageGroup: row.AgeGroup,
    focusArea: row.FocusArea,
    highlights: parseJsonColumn<string[]>(row.HighlightsJson, []),
    keySubjects: parseJsonColumn<string[]>(row.KeySubjectsJson, []),
    pedagogy: row.Pedagogy,
    iconName: row.IconName,
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
      SELECT * FROM dbo.CurriculumStages
      ${publishedOnly ? 'WHERE IsPublished = 1' : ''}
      ORDER BY SortOrder ASC
    `);
    res.json({ success: true, data: result.recordset.map(mapStage) });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body;
    if (!b?.id || !b?.stageName) throw new AppError('id and stageName are required', 400);
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.NVarChar, b.id)
      .input('stageName', sql.NVarChar, b.stageName)
      .input('nepPhase', sql.NVarChar, b.nepPhase ?? null)
      .input('grades', sql.NVarChar, b.grades ?? null)
      .input('ageGroup', sql.NVarChar, b.ageGroup ?? null)
      .input('focusArea', sql.NVarChar, b.focusArea ?? null)
      .input('highlights', sql.NVarChar, toJson(b.highlights ?? []))
      .input('keySubjects', sql.NVarChar, toJson(b.keySubjects ?? []))
      .input('pedagogy', sql.NVarChar, b.pedagogy ?? null)
      .input('iconName', sql.NVarChar, b.iconName ?? null)
      .input('sortOrder', sql.Int, b.sortOrder ?? 0)
      .input('isPublished', sql.Bit, b.isPublished === false ? 0 : 1)
      .query(`
        INSERT INTO dbo.CurriculumStages (
          Id, StageName, NepPhase, Grades, AgeGroup, FocusArea,
          HighlightsJson, KeySubjectsJson, Pedagogy, IconName, SortOrder, IsPublished
        ) VALUES (
          @id, @stageName, @nepPhase, @grades, @ageGroup, @focusArea,
          @highlights, @keySubjects, @pedagogy, @iconName, @sortOrder, @isPublished
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
      .input('stageName', sql.NVarChar, b.stageName)
      .input('nepPhase', sql.NVarChar, b.nepPhase ?? null)
      .input('grades', sql.NVarChar, b.grades ?? null)
      .input('ageGroup', sql.NVarChar, b.ageGroup ?? null)
      .input('focusArea', sql.NVarChar, b.focusArea ?? null)
      .input('highlights', sql.NVarChar, toJson(b.highlights ?? []))
      .input('keySubjects', sql.NVarChar, toJson(b.keySubjects ?? []))
      .input('pedagogy', sql.NVarChar, b.pedagogy ?? null)
      .input('iconName', sql.NVarChar, b.iconName ?? null)
      .input('sortOrder', sql.Int, b.sortOrder ?? 0)
      .input('isPublished', sql.Bit, b.isPublished === false ? 0 : 1)
      .query(`
        UPDATE dbo.CurriculumStages SET
          StageName = @stageName, NepPhase = @nepPhase, Grades = @grades,
          AgeGroup = @ageGroup, FocusArea = @focusArea, HighlightsJson = @highlights,
          KeySubjectsJson = @keySubjects, Pedagogy = @pedagogy, IconName = @iconName,
          SortOrder = @sortOrder, IsPublished = @isPublished, UpdatedAt = SYSUTCDATETIME()
        WHERE Id = @id
      `);
    if (result.rowsAffected[0] === 0) throw new AppError('Curriculum stage not found', 404);
    res.json({ success: true, message: 'Curriculum stage updated' });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.NVarChar, req.params.id)
      .query(`DELETE FROM dbo.CurriculumStages WHERE Id = @id`);
    if (result.rowsAffected[0] === 0) throw new AppError('Curriculum stage not found', 404);
    res.json({ success: true, message: 'Curriculum stage deleted' });
  })
);

export default router;
