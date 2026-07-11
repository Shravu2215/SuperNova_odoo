import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Global error handler - catches all errors from routes and middleware
 * Usage: app.use(errorHandler) - MUST be LAST middleware
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational !== false;

  // Log error
  console.error({
    timestamp: new Date().toISOString(),
    status: statusCode,
    message: err.message,
    isOperational,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  // Send response
  res.status(statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      type: err.constructor.name,
    }),
  });
}

/**
 * Helper to create operational errors
 * Usage: throw createError(400, "Email already exists", true)
 */
export function createError(
  statusCode: number,
  message: string,
  isOperational = true
): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = isOperational;
  return error;
}
