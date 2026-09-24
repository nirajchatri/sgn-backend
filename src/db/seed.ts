import { getPool, closePool, sql } from '../config/db';
import { env } from '../config/env';

function hashPassword(password: string): string {
  // Simple reversible marker for bootstrap only — replace with bcrypt in production hardening
  return Buffer.from(`sgn:${password}`).toString('base64');
}

async function seedSchoolSettings(pool: sql.ConnectionPool) {
  const settings: Record<string, string> = {
    name: 'Shanti Gyan Niketan Sr.Sec. Public School',
    sanskritMotto: 'Arise Awake and Stop not till the Goal is achieved',
    englishMotto: 'Swami Vivekanand',
    tagline: 'Nurturing Intellect, Character & Compassion',
    affiliation: 'Affiliated to Central Board of Secondary Education (CBSE), New Delhi',
    affiliationNo: 'CBSE Affiliation No: 2130988',
    schoolCode: 'School Code: 08241',
    estd: '1986',
    campusArea: '25 Acres',
    studentCount: '3,400+',
    teacherCount: '195+',
    boardResult: '100% CBSE Pass Rate (Avg. Aggregate 88.4%)',
    address: 'Goyla (Dwarka ) Near Sector - 19, New Delhi -71',
    phone: '+91 (011) 2854-9901 / +91 (011) 2854-9902',
    admissionHelpline: '+91 98112 34567',
    email: 'shantigyanniketan89@gmail.com',
    principalEmail: 'shantigyanniketan89@gmail.com',
    workingHours: 'Monday – Saturday: 07:30 AM – 03:30 PM (2nd & 4th Saturdays Off)',
  };

  for (const [key, value] of Object.entries(settings)) {
    await pool
      .request()
      .input('key', sql.NVarChar, key)
      .input('value', sql.NVarChar, value)
      .query(`
        MERGE dbo.SchoolSettings AS t
        USING (SELECT @key AS SettingKey) AS s ON t.SettingKey = s.SettingKey
        WHEN MATCHED THEN UPDATE SET SettingValue = @value, UpdatedAt = SYSUTCDATETIME()
        WHEN NOT MATCHED THEN INSERT (SettingKey, SettingValue) VALUES (@key, @value);
      `);
  }
}

async function seedCmsUser(pool: sql.ConnectionPool) {
  await pool
    .request()
    .input('username', sql.NVarChar, env.cms.adminUsername)
    .input('hash', sql.NVarChar, hashPassword(env.cms.adminPassword))
    .input('display', sql.NVarChar, 'CMS Administrator')
    .query(`
      IF NOT EXISTS (SELECT 1 FROM dbo.CmsUsers WHERE Username = @username)
      INSERT INTO dbo.CmsUsers (Username, PasswordHash, DisplayName)
      VALUES (@username, @hash, @display);
    `);
}

async function seedSampleNotice(pool: sql.ConnectionPool) {
  await pool.request().query(`
    IF NOT EXISTS (SELECT 1 FROM dbo.Notices WHERE Id = 'circ-01')
    INSERT INTO dbo.Notices (
      Id, RefNo, Title, Category, NoticeDate, IsImportant, TargetAudience,
      Summary, FullContent, SignedBy, Designation, AttachmentName, AttachmentSize, SortOrder
    ) VALUES (
      'circ-01',
      'SGN/CIR/2025-26/048',
      N'Schedule for Periodic Assessment-II (Classes VI to XII) & Guidelines',
      'Examination',
      '2025-09-18',
      1,
      N'Students & Parents of Classes VI - XII',
      N'Detailed datesheet and syllabus blueprint for Periodic Assessment-II commencing from October 6, 2025.',
      N'Dear Parents and Students,\n\nPlease find enclosed the timetable and syllabus blueprint for Periodic Assessment-II.',
      N'Dr. Meenakshi Sundaram',
      N'Principal, Shanti Gyan Niketan Sr.Sec. Public School',
      N'Datesheet_PA_II_Oct2025.pdf',
      N'420 KB',
      1
    );
  `);
}

async function seedAnnouncement(pool: sql.ConnectionPool) {
  const count = await pool.request().query(`SELECT COUNT(*) AS c FROM dbo.Announcements`);
  if (count.recordset[0].c === 0) {
    await pool.request().query(`
      INSERT INTO dbo.Announcements (Message, SortOrder, IsActive)
      VALUES (N'Admissions Open for Academic Session 2026-27 — Apply online today.', 1, 1);
    `);
  }
}

async function main() {
  const pool = await getPool();
  console.log('Seeding baseline CMS data...');
  await seedSchoolSettings(pool);
  await seedCmsUser(pool);
  await seedSampleNotice(pool);
  await seedAnnouncement(pool);
  console.log('Seed completed.');
  await closePool();
}

main().catch(async (err) => {
  console.error('Seed failed:', err);
  await closePool();
  process.exit(1);
});
