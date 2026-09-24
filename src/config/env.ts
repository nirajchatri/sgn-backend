import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  db: {
    server: required('DB_SERVER'),
    port: Number(process.env.DB_PORT || 1433),
    database: required('DB_NAME', 'sgncms'),
    user: required('DB_USER'),
    password: required('DB_PASSWORD'),
    encrypt: (process.env.DB_ENCRYPT || 'false').toLowerCase() === 'true',
    trustServerCertificate:
      (process.env.DB_TRUST_SERVER_CERTIFICATE || 'true').toLowerCase() === 'true',
  },
  cms: {
    adminUsername: process.env.CMS_ADMIN_USERNAME || 'admin',
    adminPassword: process.env.CMS_ADMIN_PASSWORD || 'sgn@cms2026',
  },
};
