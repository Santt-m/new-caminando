import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { apiRateLimiter, authRateLimiter } from './middlewares/rateLimiter.js';
import { apiRouter, panelRouter } from './routes/index.js';
import { env } from './config/env.js';
import { identifyUser } from './middlewares/identifyUser.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { trackRequest } from './middlewares/trackRequest.js';
import { securityGuard } from './middlewares/securityGuard.js';
import { honeypot } from './middlewares/honeypot.js';
import { sessionManager } from './middlewares/sessionManager.js';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.set('trust proxy', 1); // Trust first proxy (Railway/Vercel)
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(sessionManager);
  app.use(identifyUser);
  app.use(securityGuard);
  app.use(honeypot);
  app.use(trackRequest);
  app.use('/api/v1', apiRateLimiter, apiRouter);
  app.use('/api/v1/panel', apiRateLimiter, panelRouter);

  // Specific stricter limits
  app.use(['/api/v1/auth/login', '/api/v1/auth/forgot-password'], authRateLimiter);

  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Not found' });
  });

  app.use(errorHandler);

  return app;
};
