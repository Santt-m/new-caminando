import mongoose from 'mongoose';
import { env } from './env.js';
import logger, { logError } from '../utils/logger.js';

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      logger.info('[DB] Already connected.', { module: 'DATABASE' });
      return;
    }

    logger.info('[DB] Connecting to Mongo...', { module: 'DATABASE' });

    // Check if URI is defined (keeping this check as it's good practice, though not explicitly in the instruction's snippet)
    if (!env.mongoUri) {
      throw new Error('MONGODB_URI is undefined!');
    }

    await mongoose.connect(env.mongoUri, {
      dbName: env.projectId,
    });

    logger.info(`[DB] ✅ MongoDB conectado en ${env.mongoUri.substring(0, 20)}...`, { module: 'DATABASE' });
  } catch (error) {
    logError('[DB] ❌ Error conectando a MongoDB:', error instanceof Error ? error : new Error(String(error)), 'DATABASE');
    process.exit(1);
  }
};
