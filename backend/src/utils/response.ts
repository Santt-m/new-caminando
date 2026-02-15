import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages?: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: unknown[];
  code?: string;
  details?: unknown;
}

export const ok = <T>(data: T, pagination?: { total: number; page: number; limit: number }): ApiResponse<T> => ({
  success: true,
  data,
  ...(pagination ? { pagination: { ...pagination, totalPages: Math.ceil(pagination.total / pagination.limit) } } : {}),
});

export const success = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message: message || 'Operation successful',
    data,
  } as ApiResponse<T>);
};

export const error = (
  res: Response,
  message: string,
  statusCode: number = 400,
  details?: unknown,
  code?: string
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(code ? { code } : {}),
    ...(details ? { details } : {}),
  } as ApiError);
};

export const validationError = (
  res: Response,
  errors: unknown[],
  message: string = 'Validation failed'
) => {
  return res.status(400).json({
    success: false,
    message,
    errors,
  } as ApiError);
};
