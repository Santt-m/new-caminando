import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

const VISITOR_COOKIE_NAME = 'v_token';
const SESSION_COOKIE_NAME = 's_token';

// 2 años en milisegundos
const VISITOR_EXPIRY = 2 * 365 * 24 * 60 * 60 * 1000;

export const sessionManager = (req: Request, res: Response, next: NextFunction) => {
    let visitorId = req.cookies[VISITOR_COOKIE_NAME];
    let sessionId = req.cookies[SESSION_COOKIE_NAME] || req.header('x-session-id');

    if (!visitorId) {
        visitorId = randomUUID();
        res.cookie(VISITOR_COOKIE_NAME, visitorId, {
            maxAge: VISITOR_EXPIRY,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
    }

    if (!sessionId) {
        sessionId = randomUUID();
        res.cookie(SESSION_COOKIE_NAME, sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
    }

    req.visitorId = visitorId;
    req.sessionId = sessionId;

    next();
};
