import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import { getPool, closePool } from './config/db';
import apiRouter from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();

const origins =
  env.corsOrigin === '*'
    ? true
    : env.corsOrigin.split(',').map((o) => o.trim());

app.use(
  cors({
    origin: origins,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/', (_req, res) => {
  res.redirect('/api');
});

app.use('/api', apiRouter);
app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await getPool();
    console.log(`Connected to MSSQL [${env.db.database}] @ ${env.db.server}`);
  } catch (err) {
    console.warn(
      'Warning: could not connect to MSSQL at startup. API will retry on first request.'
    );
    console.warn(err instanceof Error ? err.message : err);
  }

  const server = app.listen(env.port, () => {
    console.log(`SGN API listening on http://localhost:${env.port}`);
    console.log(`Health check: http://localhost:${env.port}/api/health`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received, shutting down...`);
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

start();
