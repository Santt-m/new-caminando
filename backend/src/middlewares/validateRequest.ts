import { type Request, type Response, type NextFunction } from 'express';
import { ZodError, type ZodSchema, type ZodIssue } from 'zod';
import { logWarn } from '../utils/logger.js';
import { validationError } from '../utils/response.js';

export const validateRequest = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const issues = error.issues.map((e: ZodIssue) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));

                logWarn('Validation Failed', 'SECURITY', {
                    path: req.originalUrl,
                    issues
                }, {
                    ip: req.ip,
                    userAgent: req.headers['user-agent'],
                    path: req.originalUrl,
                    method: req.method
                });

                validationError(res, issues);
                return;
                return;
            }
            res.status(500).json({ message: 'Internal server error' });
        }
    };
};
