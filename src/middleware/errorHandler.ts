import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof Error ? err.message : 'Unexpected server error';

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    error: message,
  });
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ success: false, error: 'Not found' });
}
