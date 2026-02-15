import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';
import { logError } from './utils/logger.js';
import logger from './utils/logger.js';
import { startScraperWorker } from './workers/scraper.worker.js';

const start = async () => {
  try {
    await connectDB();
    await connectRedis();

    // Iniciar el worker de BullMQ
    startScraperWorker();

    const app = createApp();
    app.listen(env.port, () => {
      logger.info(`API listening on http://localhost:${env.port}`, { module: 'SYSTEM' });
    });
  } catch (error) {
    logError('Failed to start server', error instanceof Error ? error : new Error(String(error)));
    process.exit(1);
  }
};

start();
