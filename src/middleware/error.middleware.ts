import { Request, Response, NextFunction } from "express";

/**
 * Global error handler.
 * Catches unhandled errors and returns a safe JSON response.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[ERROR] ${err.message}`, err.stack);

  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Terjadi kesalahan pada server"
        : err.message,
  });
}
