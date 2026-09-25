/**
 * Quick MSSQL connectivity check (uses project-root .env).
 * Usage: node scripts/check-mssql.mjs
 */
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const dotenv = require('dotenv');
const sql = require('mssql');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });

function stripQuotes(v) {
  let s = String(v ?? '').trim();
  if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
    s = s.slice(1, -1);
  }
  return s.replace(/\\\$/g, '$');
}

const server = process.env.MSSQL_SERVER?.trim();
const database = process.env.MSSQL_DATABASE?.trim();
const user = process.env.MSSQL_USER?.trim();
const password = stripQuotes(process.env.MSSQL_PASSWORD ?? '');
const port = Number(process.env.MSSQL_PORT || 1433);

console.log('Checking MSSQL…');
console.log(`  server:   ${server}`);
console.log(`  port:     ${port}`);
console.log(`  database: ${database}`);
console.log(`  user:     ${user}`);
console.log(`  password: ${password ? `(length ${password.length})` : '(empty)'}`);

if (!server || !database || !user) {
  console.error('Missing MSSQL_SERVER / MSSQL_DATABASE / MSSQL_USER in .env');
  process.exit(1);
}

try {
  const pool = await sql.connect({
    server,
    database,
    user,
    password,
    port,
    connectionTimeout: 15000,
    options: {
      encrypt: process.env.MSSQL_ENCRYPT !== 'false',
      trustServerCertificate: process.env.MSSQL_TRUST_SERVER_CERTIFICATE !== 'false',
    },
  });
  const result = await pool.request().query('SELECT @@VERSION AS version, DB_NAME() AS db');
  console.log('OK — connected');
  console.log('  db:', result.recordset[0]?.db);
  console.log('  version:', String(result.recordset[0]?.version || '').split('\n')[0]);
  await pool.close();
  process.exit(0);
} catch (err) {
  console.error('FAILED:', err instanceof Error ? err.message : err);
  console.error(`
Common fixes:
  - SQL Server Browser / TCP 1433 enabled on the SQL host
  - Firewall allows the web server → ${server}:${port}
  - If SQL is on THIS machine, try MSSQL_SERVER=localhost or 127.0.0.1
  - sa login enabled + password matches (escape $ in .env as \\$)
  - Database "${database}" exists
`);
  process.exit(1);
}
