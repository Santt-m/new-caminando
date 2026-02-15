import { createApp } from '../app.js';
import { connectDB } from '../config/db.js';
import { connectRedis } from '../config/redis.js';
import mongoose from 'mongoose'; // Assuming mongoose is used for connection state check
import type { Request, Response, NextFunction } from 'express';

const app = createApp();

// Conectar a DB y Redis antes de procesar la request
// En Vercel, esto reutilizará la conexión "caliente" si la lambda ya está iniciada
// Iniciamos la conexión fuera del handler para aprovechar el "container reuse"
console.log('[Vercel] 🚀 Cold Start: Initializing connections...');
const dbPromise = connectDB().catch((err: Error) => console.error('[Vercel] ❌ Mongo Init Error:', err));
const redisPromise = connectRedis().catch((err: Error) => console.error('[Vercel] ❌ Redis Init Error:', err));

app.use(async (_req: Request, _res: Response, next: NextFunction) => {
    // Aseguramos que la DB esté conectada antes de procesar
    if (mongoose.connection.readyState !== 1) {
        console.log('[Vercel] ⏳ Waiting for DB connection...');
        await Promise.race([
            dbPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('DB Connection Timeout')), 5000))
        ]).catch((err: Error) => console.error('[Vercel] ⚠️ DB Wait Error:', err));
    }

    // Redis es opcional, no bloqueamos fuerte, pero intentamos
    if (process.env.REDIS_URL) {
        await Promise.race([
            redisPromise,
            new Promise((resolve) => setTimeout(resolve, 2000)) // 2s max wait for Redis
        ]).catch(err => console.error('[Vercel] ⚠️ Redis Wait Error:', err));
    }

    next();
});

// Exportar app para Vercel
export default app;
