import * as dotenv from 'dotenv';
import * as path from 'path';

// Carga el .env del root si no estamos en producción (o si queremos forzarlo localmente)
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const getEnv = (key: string, fallback?: string) => {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const env = {
  projectId: process.env.PROJECT_ID || 'santtproject',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGODB_URL || getEnv('MONGODB_URI'),
  mongoDbName: process.env.MONGO_DB_NAME || 'test',
  corsOrigin: getEnv('CORS_ORIGIN', 'http://localhost:5173'),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 100),
  jwtSecret: getEnv('JWT_SECRET'),
  refreshSecret: getEnv('REFRESH_SECRET'),
  adminEmail: getEnv('ADMIN_EMAIL'),
  adminPassword: getEnv('ADMIN_PASSWORD'),
  redisUrl: getEnv('REDIS_URL', 'redis://localhost:6379'),
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  // SMTP
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || '',
  // Scraper
  headless: process.env.HEADLESS !== 'false', // Default to true unless explicitly set to 'false'
};
