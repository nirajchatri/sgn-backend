import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import sql from 'mssql';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

/** Load .env from project root (works even if cwd is wrong on Windows services). */
export function loadEnv(): dotenv.DotenvConfigOutput {
  const result = dotenv.config({
    path: path.join(rootDir, '.env'),
  });
  normalizeLegacyEnv();
  return result;
}

/**
 * Accept older production .env keys (DB_*, PORT) used by the previous API package.
 * Preferred names: MSSQL_*, API_PORT.
 */
function normalizeLegacyEnv(): void {
  const map: Array<[legacy: string, modern: string]> = [
    ['PORT', 'API_PORT'],
    ['DB_SERVER', 'MSSQL_SERVER'],
    ['DB_PORT', 'MSSQL_PORT'],
    ['DB_NAME', 'MSSQL_DATABASE'],
    ['DB_USER', 'MSSQL_USER'],
    ['DB_PASSWORD', 'MSSQL_PASSWORD'],
    ['DB_ENCRYPT', 'MSSQL_ENCRYPT'],
    ['DB_TRUST_SERVER_CERTIFICATE', 'MSSQL_TRUST_SERVER_CERTIFICATE'],
  ];
  for (const [legacy, modern] of map) {
    const legacyVal = process.env[legacy]?.trim();
    if (legacyVal && !process.env[modern]?.trim()) {
      process.env[modern] = process.env[legacy];
    }
  }
}

function hasDiscreteConfig(): boolean {
  return Boolean(
    process.env.MSSQL_SERVER?.trim() &&
      process.env.MSSQL_DATABASE?.trim() &&
      process.env.MSSQL_USER?.trim()
  );
}

function stripWrappingQuotes(value: string): string {
  let v = value.trim();
  if (
    (v.startsWith("'") && v.endsWith("'") && v.length >= 2) ||
    (v.startsWith('"') && v.endsWith('"') && v.length >= 2)
  ) {
    v = v.slice(1, -1);
  }
  // Allow writing \$ in .env so $ is not treated as expansion → real $
  v = v.replace(/\\\$/g, '$');
  return v;
}

export function getMssqlDiagnostics(): {
  mode: 'connectionString' | 'discrete' | 'missing';
  server?: string;
  database?: string;
  user?: string;
  port?: number;
} {
  if (process.env.MSSQL_CONNECTION_STRING?.trim()) {
    return { mode: 'connectionString' };
  }
  if (!hasDiscreteConfig()) {
    return { mode: 'missing' };
  }
  return {
    mode: 'discrete',
    server: process.env.MSSQL_SERVER!.trim(),
    database: process.env.MSSQL_DATABASE!.trim(),
    user: process.env.MSSQL_USER!.trim(),
    port: Number(process.env.MSSQL_PORT || 1433),
  };
}

function buildConfig(): sql.config {
  const server = process.env.MSSQL_SERVER!.trim();
  const database = process.env.MSSQL_DATABASE!.trim();
  const user = process.env.MSSQL_USER!.trim();
  const password = stripWrappingQuotes(process.env.MSSQL_PASSWORD ?? '');

  return {
    server,
    database,
    user,
    password,
    port: Number(process.env.MSSQL_PORT || 1433),
    connectionTimeout: Number(process.env.MSSQL_CONNECTION_TIMEOUT_MS || 15000),
    requestTimeout: Number(process.env.MSSQL_REQUEST_TIMEOUT_MS || 30000),
    options: {
      encrypt: process.env.MSSQL_ENCRYPT !== 'false',
      trustServerCertificate: process.env.MSSQL_TRUST_SERVER_CERTIFICATE !== 'false',
      enableArithAbort: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };
}

let poolPromise: Promise<sql.ConnectionPool> | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!poolPromise) {
    poolPromise = (async () => {
      const connectionString = process.env.MSSQL_CONNECTION_STRING?.trim();
      if (connectionString) {
        return sql.connect(connectionString);
      }
      if (!hasDiscreteConfig()) {
        throw new Error(
          'MSSQL is not configured. Set MSSQL_CONNECTION_STRING or MSSQL_SERVER, MSSQL_DATABASE, and MSSQL_USER in .env'
        );
      }
      return new sql.ConnectionPool(buildConfig()).connect();
    })().catch((err) => {
      poolPromise = null;
      throw err;
    });
  }
  return poolPromise;
}

export async function pingDatabase(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const pool = await getPool();
    await pool.request().query('SELECT 1 AS ok');
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Database unavailable',
    };
  }
}

// Re-export menu helpers for any legacy imports
export {
  fetchMenuItems,
  replaceMenuItems,
  ensureCmsSchema,
  type MenuItemPayload,
} from './cmsStore.js';
