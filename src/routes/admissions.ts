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
      .query(`SELECT * FROM dbo.AdmissionInquiries ORDER BY CreatedAt DESC`);
    res.json({ success: true, data: result.recordset });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body;
    if (!b?.studentName || !b?.parentName || !b?.parentPhone) {
      throw new AppError('studentName, parentName, and parentPhone are required', 400);
    }
    const pool = await getPool();
    const result = await pool
      .request()
      .input('studentName', sql.NVarChar, b.studentName)
      .input('dob', sql.Date, b.dob ?? b.dateOfBirth ?? null)
      .input('grade', sql.NVarChar, b.gradeApplying ?? null)
      .input('parentName', sql.NVarChar, b.parentName)
      .input('parentEmail', sql.NVarChar, b.parentEmail ?? null)
      .input('parentPhone', sql.NVarChar, b.parentPhone)
      .input('currentSchool', sql.NVarChar, b.currentSchool ?? null)
      .input('address', sql.NVarChar, b.address ?? null)
      .input('transport', sql.Bit, b.transportRequired ? 1 : 0)
      .input('medical', sql.NVarChar, b.medicalConditions ?? null)
      .query(`
        INSERT INTO dbo.AdmissionInquiries (
          StudentName, DateOfBirth, GradeApplying, ParentName, ParentEmail, ParentPhone,
          CurrentSchool, Address, TransportRequired, MedicalConditions
        )
        OUTPUT INSERTED.Id, INSERTED.CreatedAt
        VALUES (
          @studentName, @dob, @grade, @parentName, @parentEmail, @parentPhone,
          @currentSchool, @address, @transport, @medical
        )
      `);
    res.status(201).json({ success: true, data: result.recordset[0] });
  })
);

export default router;
