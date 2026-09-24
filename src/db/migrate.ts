import fs from 'fs';
import path from 'path';
import sql from 'mssql';
import { env } from '../config/env';

async function ensureDatabase(): Promise<void> {
  const masterConfig: sql.config = {
    server: env.db.server,
    port: env.db.port,
    database: 'master',
    user: env.db.user,
    password: env.db.password,
    options: {
      encrypt: env.db.encrypt,
      trustServerCertificate: env.db.trustServerCertificate,
      enableArithAbort: true,
    },
    connectionTimeout: 30000,
    requestTimeout: 60000,
  };

  const pool = await new sql.ConnectionPool(masterConfig).connect();
  try {
    const result = await pool
      .request()
      .input('name', sql.NVarChar, env.db.database)
      .query(`SELECT database_id FROM sys.databases WHERE name = @name`);

    if (result.recordset.length === 0) {
      console.log(`Creating database [${env.db.database}]...`);
      await pool.request().query(
        `CREATE DATABASE [${env.db.database.replace(/]/g, ']]')}]`
      );
      console.log(`Database [${env.db.database}] created.`);
    } else {
      console.log(`Database [${env.db.database}] already exists.`);
    }
  } finally {
    await pool.close();
  }
}

async function runSchema(): Promise<void> {
  const candidates = [
    path.join(__dirname, 'schema.sql'),
    path.join(process.cwd(), 'src/db/schema.sql'),
    path.join(process.cwd(), 'dist/db/schema.sql'),
  ];
  const schemaPath = candidates.find((p) => fs.existsSync(p));
  if (!schemaPath) {
    throw new Error('schema.sql not found');
  }
  const sqlText = fs.readFileSync(schemaPath, 'utf8');

  const batches = sqlText
    .split(/^\s*GO\s*$/gim)
    .map((b) => b.trim())
    .filter(Boolean);

  const pool = await new sql.ConnectionPool({
    server: env.db.server,
    port: env.db.port,
    database: env.db.database,
    user: env.db.user,
    password: env.db.password,
    options: {
      encrypt: env.db.encrypt,
      trustServerCertificate: env.db.trustServerCertificate,
      enableArithAbort: true,
    },
    connectionTimeout: 30000,
    requestTimeout: 60000,
  }).connect();

  try {
    console.log(`Running ${batches.length} schema batches...`);
    for (let i = 0; i < batches.length; i++) {
      await pool.request().query(batches[i]);
      console.log(`  ✓ batch ${i + 1}/${batches.length}`);
    }
    console.log('Schema migration completed.');
  } finally {
    await pool.close();
  }
}

async function main() {
  console.log(`Connecting to ${env.db.server}:${env.db.port} as ${env.db.user}...`);
  await ensureDatabase();
  await runSchema();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
