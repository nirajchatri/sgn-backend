import { Router } from 'express';
import { getPool, sql } from '../config/db';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const pool = await getPool();
    const [structures, transport] = await Promise.all([
      pool.request().query(`SELECT * FROM dbo.FeeStructures ORDER BY SortOrder ASC`),
      pool.request().query(`SELECT * FROM dbo.TransportFeeSlabs ORDER BY SortOrder ASC`),
    ]);

    res.json({
      success: true,
      data: {
        gradeBands: structures.recordset.map((row) => ({
          id: row.Id,
          gradeBand: row.GradeBand,
          admissionFeeOneTime: row.AdmissionFeeOneTime,
          annualCharges: row.AnnualCharges,
          developmentFeePerQuarter: row.DevelopmentFeePerQuarter,
          tuitionFeePerQuarter: row.TuitionFeePerQuarter,
          labChargesPerQuarter: row.LabChargesPerQuarter,
          mealPlanPerQuarter: row.MealPlanPerQuarter,
        })),
        transportSlabs: transport.recordset.map((row) => ({
          id: row.Id,
          zone: row.Zone,
          feePerQuarter: row.FeePerQuarter,
        })),
      },
    });
  })
);

router.post(
  '/structures',
  asyncHandler(async (req, res) => {
    const b = req.body;
    if (!b?.gradeBand) throw new AppError('gradeBand is required', 400);
    const pool = await getPool();
    await pool
      .request()
      .input('gradeBand', sql.NVarChar, b.gradeBand)
      .input('admission', sql.Decimal(12, 2), b.admissionFeeOneTime ?? null)
      .input('annual', sql.Decimal(12, 2), b.annualCharges ?? null)
      .input('dev', sql.Decimal(12, 2), b.developmentFeePerQuarter ?? null)
      .input('tuition', sql.Decimal(12, 2), b.tuitionFeePerQuarter ?? null)
      .input('lab', sql.Decimal(12, 2), b.labChargesPerQuarter ?? null)
      .input('meal', sql.Decimal(12, 2), b.mealPlanPerQuarter ?? null)
      .input('sortOrder', sql.Int, b.sortOrder ?? 0)
      .query(`
        MERGE dbo.FeeStructures AS t
        USING (SELECT @gradeBand AS GradeBand) AS s ON t.GradeBand = s.GradeBand
        WHEN MATCHED THEN UPDATE SET
          AdmissionFeeOneTime = @admission,
          AnnualCharges = @annual,
          DevelopmentFeePerQuarter = @dev,
          TuitionFeePerQuarter = @tuition,
          LabChargesPerQuarter = @lab,
          MealPlanPerQuarter = @meal,
          SortOrder = @sortOrder,
          UpdatedAt = SYSUTCDATETIME()
        WHEN NOT MATCHED THEN INSERT (
          GradeBand, AdmissionFeeOneTime, AnnualCharges, DevelopmentFeePerQuarter,
          TuitionFeePerQuarter, LabChargesPerQuarter, MealPlanPerQuarter, SortOrder
        ) VALUES (
          @gradeBand, @admission, @annual, @dev, @tuition, @lab, @meal, @sortOrder
        );
      `);
    res.status(201).json({ success: true, message: 'Fee structure saved' });
  })
);

router.post(
  '/transport',
  asyncHandler(async (req, res) => {
    const b = req.body;
    if (!b?.zone || b.feePerQuarter == null) {
      throw new AppError('zone and feePerQuarter are required', 400);
    }
    const pool = await getPool();
    const result = await pool
      .request()
      .input('zone', sql.NVarChar, b.zone)
      .input('fee', sql.Decimal(12, 2), b.feePerQuarter)
      .input('sortOrder', sql.Int, b.sortOrder ?? 0)
      .query(`
        INSERT INTO dbo.TransportFeeSlabs (Zone, FeePerQuarter, SortOrder)
        OUTPUT INSERTED.Id
        VALUES (@zone, @fee, @sortOrder)
      `);
    res.status(201).json({ success: true, data: { id: result.recordset[0].Id } });
  })
);

export default router;
