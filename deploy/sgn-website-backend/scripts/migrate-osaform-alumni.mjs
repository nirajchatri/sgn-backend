/**
 * Migrate webcampus_sgn.dbo.WC_OSAFORM -> sgncms.dbo.WebsiteAlumni
 * Usage: node scripts/migrate-osaform-alumni.mjs
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sql from 'mssql';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function stripQuotes(value) {
  const v = value ?? '';
  if (
    (v.startsWith("'") && v.endsWith("'")) ||
    (v.startsWith('"') && v.endsWith('"'))
  ) {
    return v.slice(1, -1);
  }
  return v;
}

const config = {
  server: process.env.MSSQL_SERVER?.trim(),
  port: Number(process.env.MSSQL_PORT || 1433),
  user: process.env.MSSQL_USER?.trim(),
  password: stripQuotes(process.env.MSSQL_PASSWORD),
  database: 'sgncms',
  options: {
    encrypt: process.env.MSSQL_ENCRYPT !== 'false',
    trustServerCertificate: process.env.MSSQL_TRUST_SERVER_CERTIFICATE !== 'false',
  },
  requestTimeout: 120000,
};

if (!config.server || !config.user) {
  console.error('MSSQL_SERVER and MSSQL_USER are required in .env');
  process.exit(1);
}

const sqlPath = path.join(__dirname, '../server/sql/MigrateWcOsaformToWebsiteAlumni.sql');
const raw = fs.readFileSync(sqlPath, 'utf8');

// Split on GO batches (line-based), skip USE/RETURN-style control for mssql driver
const batches = raw
  .split(/^\s*GO\s*$/gim)
  .map((b) => b.trim())
  .filter((b) => b.length > 0 && !/^USE\s+/i.test(b));

const pool = await sql.connect(config);
try {
  // Ensure target table exists
  await pool.request().query(`
    IF OBJECT_ID(N'dbo.WebsiteAlumni', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.WebsiteAlumni (
        Id NVARCHAR(64) NOT NULL CONSTRAINT PK_WebsiteAlumni PRIMARY KEY,
        FullName NVARCHAR(200) NOT NULL,
        BatchYear NVARCHAR(20) NOT NULL,
        ClassPassed NVARCHAR(100) NOT NULL,
        FatherName NVARCHAR(200) NULL,
        CurrentRole NVARCHAR(200) NOT NULL,
        Organization NVARCHAR(200) NULL,
        Location NVARCHAR(200) NULL,
        Email NVARCHAR(200) NOT NULL,
        Phone NVARCHAR(50) NULL,
        LinkedIn NVARCHAR(500) NULL,
        PhotoUrl NVARCHAR(MAX) NULL,
        Bio NVARCHAR(MAX) NULL,
        Status NVARCHAR(20) NOT NULL CONSTRAINT DF_WebsiteAlumni_Status DEFAULT (N'pending'),
        CreatedAt NVARCHAR(40) NOT NULL,
        SortOrder INT NOT NULL CONSTRAINT DF_WebsiteAlumni_SortOrder DEFAULT (0),
        UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteAlumni_UpdatedAt DEFAULT (SYSUTCDATETIME())
      );
    END;
    IF COL_LENGTH(N'dbo.WebsiteAlumni', N'FatherName') IS NULL
      ALTER TABLE dbo.WebsiteAlumni ADD FatherName NVARCHAR(200) NULL;
  `);

  const before = await pool.request().query(`SELECT COUNT(*) AS C FROM dbo.WebsiteAlumni`);
  console.log('WebsiteAlumni before:', before.recordset[0].C);

  for (const batch of batches) {
    if (/^IF OBJECT_ID[\s\S]*RAISERROR/i.test(batch)) continue;
    if (/^IF COL_LENGTH/i.test(batch)) continue; // already handled above
    const result = await pool.request().query(batch);
    if (result.recordset?.length) {
      console.log(result.recordset[0]);
    } else if (typeof result.rowsAffected?.[0] === 'number') {
      console.log('Rows affected:', result.rowsAffected[0]);
    }
  }

  const after = await pool.request().query(`
    SELECT
      (SELECT COUNT(*) FROM dbo.WebsiteAlumni WHERE Id LIKE N'alumni-osa-%') AS MigratedOsaRows,
      (SELECT COUNT(*) FROM dbo.WebsiteAlumni) AS TotalAlumniRows
  `);
  console.log('Done:', after.recordset[0]);
} finally {
  await pool.close();
}
