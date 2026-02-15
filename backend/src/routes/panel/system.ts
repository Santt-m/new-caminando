import { Router, type Request, type Response } from 'express';

import mongoose from 'mongoose';
import { requireAdmin } from '../../middlewares/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ok } from '../../utils/response.js';
import { redisClient } from '../../config/redis.js';

interface RedisInfo {
  [key: string]: string;
}

interface RedisKeyPattern {
  pattern: string;
  count: number;
}

interface RedisSlowLogEntry {
  id: number;
  timestamp: number;
  duration: number;
  args: string[];
}
export const adminSystemRouter = Router();
adminSystemRouter.use(requireAdmin);

import { CleanupService } from '../../services/CleanupService.js';
import { env } from '../../config/env.js';
import { logAudit, logError } from '../../utils/logger.js';

// Límite de memoria para entorno serverless (Vercel standard fallback or env)
const getMemoryLimit = () => {
  return process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE
    ? parseInt(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE) * 1024 * 1024
    : 1024 * 1024 * 512; // 512MB
};

// --- ENDPOINTS DE LIMPIEZA ---

adminSystemRouter.get(
  '/cleanup/estimate',
  asyncHandler(async (_req: Request, res: Response) => {
    const estimate = await CleanupService.estimateCleanup();
    res.json(ok(estimate));
  })
);

adminSystemRouter.post(
  '/cleanup/execute',
  asyncHandler(async (req: Request, res: Response) => {
    const { password } = req.body as { password?: string };

    if (password !== env.adminPassword) {
      res.status(401).json({ message: 'Invalid admin password' });
      return;
    }

    const result = await CleanupService.executeCleanup();
    if (result.success) {
      res.json(ok(result));
    } else {
      res.status(500).json({ message: result.error || 'Cleanup failed' });
    }
  })
);

const getRedisInfo = async () => {
  const redisInfoParsed: RedisInfo = {};
  if (redisClient.isOpen) {
    const info = await redisClient.info();
    info.split('\n').forEach((line: string) => {
      const [key, value] = line.split(':');
      if (key && value) redisInfoParsed[key.trim()] = value.trim();
    });
  }
  return redisInfoParsed;
};

// Endpoint para métricas simplificadas (Serverless)
adminSystemRouter.get(
  '/metrics',
  asyncHandler(async (_req: Request, res: Response) => {
    const db = mongoose.connection.db;

    // Stats de MongoDB
    const mongoStats = db ? await db.stats() : null;

    // Stats de Redis (Parsing info string)
    const redisInfoParsed = await getRedisInfo();

    // Check Cloudinary status
    let cloudinaryStatus = 'disconnected';
    try {
      const { v2: cloudinary } = await import('cloudinary');
      // We use a simple ping or a fast API call
      await cloudinary.api.ping();
      cloudinaryStatus = 'connected';
    } catch (error) {
      logError('Cloudinary health check failed:', error instanceof Error ? error : new Error(String(error)), 'SYSTEM');
    }

    // En serverless, el límite de memoria puede variar o no ser reportado por el proceso.
    const memoryLimit = getMemoryLimit();

    const metrics = {
      os: {
        uptime: process.uptime(),
        platform: process.platform === 'linux' ? 'linux-serverless' : process.platform,
        release: '1.0.0',
        loadAvg: [0, 0, 0], // En serverless el loadAvg no suele ser útil/disponible por instancia
      },
      memory: {
        total: memoryLimit,
        free: Math.max(0, memoryLimit - process.memoryUsage().rss),
        used: process.memoryUsage().rss,
        usagePercentage: (process.memoryUsage().rss / memoryLimit) * 100,
      },
      cpu: {
        count: 1, // Lambdas suelen exponer un solo core
        model: 'Serverless Context',
      },
      process: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
      database: {
        mongodb: {
          status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
          collections: await db?.listCollections().toArray().then(c => c.length) || 0,
          objects: mongoStats?.objects || 0,
          dataSize: mongoStats?.dataSize || 0,
          storageSize: mongoStats?.storageSize || 0,
          indexes: mongoStats?.indexes || 0,
          indexSize: mongoStats?.indexSize || 0,
        },
        redis: {
          status: redisClient.isOpen ? 'connected' : 'disconnected',
          version: redisInfoParsed.redis_version || 'unknown',
          usedMemory: redisInfoParsed.used_memory_human || '0B',
          connectedClients: parseInt(redisInfoParsed.connected_clients || '0'),
          uptimeDays: parseInt(redisInfoParsed.uptime_in_days || '0'),
          totalKeys: 0,
        },
        cloudinary: {
          status: cloudinaryStatus
        }
      },
      eventLoop: {
        lag: await (async () => {
          const start = process.hrtime();
          await new Promise(resolve => setImmediate(resolve));
          const diff = process.hrtime(start);
          return (diff[0] * 1e3) + (diff[1] / 1e6); // Convert to ms
        })()
      }
    };

    res.json(ok(metrics));
  })
);

adminSystemRouter.get(
  '/history',
  asyncHandler(async (_req: Request, res: Response) => {
    const latenciesRaw = await redisClient.lRange('metrics:latency', 0, -1);

    // Obtener stats actuales como referencia
    // Obtener stats actuales como referencia
    const db = mongoose.connection.db;
    const mongoStats = db ? await db.stats() : null;
    const redisInfoParsed = await getRedisInfo();
    const memoryLimit = getMemoryLimit();

    const history = latenciesRaw.map((raw: string, index: number) => {
      const data = JSON.parse(raw);
      return {
        _id: `h-${index}`,
        timestamp: data.timestamp,
        cpuLoad: data.cpuLoad || 0,
        memoryUsage: data.memoryRSS || process.memoryUsage().rss,
        memoryTotal: memoryLimit,
        latency: data.latency,
        path: data.path,
        eventLoop: { lag: data.eventLoopLag || data.latency },
        redis: {
          usedMemory: redisInfoParsed.used_memory_human || '0B',
          connectedClients: parseInt(redisInfoParsed.connected_clients || '0')
        },
        mongodb: {
          objects: mongoStats?.objects || 0,
          dataSize: mongoStats?.dataSize || 0
        }
      };
    }).reverse();

    res.json(ok(history));
  })
);
adminSystemRouter.post(
  '/cache/clear',
  asyncHandler(async (req: Request, res: Response) => {
    const { password } = req.body as { password?: string };
    if (password !== env.adminPassword) {
      res.status(401).json({ message: 'Invalid admin password' });
      return;
    }
    await redisClient.flushDb();
    res.json({ success: true, message: 'Cache cleared' });

    logAudit('Cache cleared manually', 'SYSTEM', { method: 'flushDb' }, { ip: req.ip, userAgent: req.headers['user-agent'] }, req.userId);
  })
);



adminSystemRouter.get(
  '/mongodb/collections',
  asyncHandler(async (_req: Request, res: Response) => {
    const db = mongoose.connection.db;
    if (!db) {
      res.status(503).json({ message: 'Database not connected' });
      return;
    }

    const collections = await db.listCollections().toArray();
    const stats = await db.stats();

    const data = await Promise.all(
      collections.map(async (c) => {
        try {
          const collStats = await db.command({ collStats: c.name });
          return {
            name: c.name,
            count: collStats.count || 0,
            avgSize: collStats.avgObjSize || 0,
            totalSize: collStats.size || 0,
            indexes: collStats.nindexes || 0,
            indexSize: collStats.totalIndexSize || 0,
          };
        } catch (error) {
          logError(`Error fetching stats for collection ${c.name}:`, error instanceof Error ? error : new Error(String(error)), 'DATABASE');
          return {
            name: c.name,
            count: 0,
            avgSize: 0,
            totalSize: 0,
            indexes: 0,
            indexSize: 0,
          };
        }
      })
    );

    res.json(
      ok({
        collections: data,
        totalCollections: collections.length,
        totalDocuments: stats.objects,
        totalDataSize: stats.dataSize,
      })
    );
  })
);

adminSystemRouter.delete(
  '/mongodb/collections/:collection',
  asyncHandler(async (req: Request, res: Response) => {
    const db = mongoose.connection.db;
    const { collection: collectionName } = req.params;
    const { confirm, password } = req.body as { confirm: string, password?: string };

    if (!db) {
      res.status(503).json({ message: 'Database not connected' });
      return;
    }

    if (password !== env.adminPassword) {
      res.status(401).json({ message: 'Invalid admin password' });
      return;
    }

    if (confirm !== collectionName) {
      res.status(400).json({ message: 'Invalid confirmation. Must type the collection name.' });
      return;
    }

    await db.dropCollection(collectionName);
    res.json(ok({ deleted: true, collection: collectionName }));

    logAudit(`MongoDB collection dropped: ${collectionName}`, 'DATABASE', { collectionName }, { ip: req.ip, userAgent: req.headers['user-agent'] }, req.userId);
  })
);

adminSystemRouter.get(
  '/mongodb/collections/:collection/documents',
  asyncHandler(async (req: Request, res: Response) => {
    const db = mongoose.connection.db;
    if (!db) {
      res.status(503).json({ message: 'Database not connected' });
      return;
    }
    const collection = db.collection(req.params.collection);
    const filter = req.query.filter ? JSON.parse(String(req.query.filter)) : {};
    const sort = req.query.sort ? JSON.parse(String(req.query.sort)) : {};
    const limit = Number(req.query.limit ?? 20);
    const skip = Number(req.query.skip ?? 0);

    const [documents, total] = await Promise.all([
      collection.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
      collection.countDocuments(filter),
    ]);

    res.json(ok({ documents, total, page: Math.floor(skip / limit) + 1, totalPages: Math.ceil(total / limit), limit }));
  })
);

adminSystemRouter.get(
  '/mongodb/collections/:collection/documents/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const db = mongoose.connection.db;
    if (!db) {
      res.status(503).json({ message: 'Database not connected' });
      return;
    }
    const collection = db.collection(req.params.collection);
    const doc = await collection.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    res.json(ok(doc));
  })
);

adminSystemRouter.post(
  '/mongodb/collections/:collection/documents',
  asyncHandler(async (req: Request, res: Response) => {
    const db = mongoose.connection.db;
    if (!db) {
      res.status(503).json({ message: 'Database not connected' });
      return;
    }
    const collection = db.collection(req.params.collection);
    const result = await collection.insertOne(req.body);
    res.json(ok({ _id: result.insertedId, ...req.body }));
  })
);

adminSystemRouter.put(
  '/mongodb/collections/:collection/documents/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const db = mongoose.connection.db;
    if (!db) {
      res.status(503).json({ message: 'Database not connected' });
      return;
    }
    const collection = db.collection(req.params.collection);
    await collection.updateOne({ _id: new mongoose.Types.ObjectId(req.params.id) }, { $set: req.body });
    const doc = await collection.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    res.json(ok(doc));
  })
);

adminSystemRouter.delete(
  '/mongodb/collections/:collection/documents/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const db = mongoose.connection.db;
    const { password } = req.body as { password?: string };

    if (!db) {
      res.status(503).json({ message: 'Database not connected' });
      return;
    }

    if (password !== env.adminPassword) {
      res.status(401).json({ message: 'Invalid admin password' });
      return;
    }

    const collection = db.collection(req.params.collection);
    await collection.deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    res.json(ok({ deleted: true }));
  })
);

adminSystemRouter.get(
  '/mongodb/collections/:collection/indexes',
  asyncHandler(async (req: Request, res: Response) => {
    const db = mongoose.connection.db;
    if (!db) {
      res.status(503).json({ message: 'Database not connected' });
      return;
    }
    const collection = db.collection(req.params.collection);
    const indexes = await collection.indexes();
    res.json(ok(indexes));
  })
);

adminSystemRouter.post(
  '/mongodb/collections/:collection/indexes',
  asyncHandler(async (req: Request, res: Response) => {
    const db = mongoose.connection.db;
    if (!db) {
      res.status(503).json({ message: 'Database not connected' });
      return;
    }
    const collection = db.collection(req.params.collection);
    const indexName = await collection.createIndex(req.body.keys, req.body.options);
    res.json(ok({ indexName }));
  })
);

adminSystemRouter.delete(
  '/mongodb/collections/:collection/indexes/:indexName',
  asyncHandler(async (req: Request, res: Response) => {
    const db = mongoose.connection.db;
    if (!db) {
      res.status(503).json({ message: 'Database not connected' });
      return;
    }
    const collection = db.collection(req.params.collection);
    await collection.dropIndex(req.params.indexName);
    res.json(ok({ dropped: true }));
  })
);

adminSystemRouter.get(
  '/redis/analysis',
  asyncHandler(async (_req: Request, res: Response) => {
    let keysByPattern: RedisKeyPattern[] = [];
    let hitRate = 0, evictedKeys = 0, expiredKeys = 0, totalMemory = 0, peakMemory = 0;

    if (redisClient.isOpen) {
      const info = await redisClient.info();
      const stats: Record<string, string> = {};
      info.split('\n').forEach((line: string) => {
        const [key, value] = line.split(':');
        if (key && value) stats[key.trim()] = value.trim();
      });

      const hits = parseInt(stats.keyspace_hits || '0');
      const misses = parseInt(stats.keyspace_misses || '0');
      hitRate = (hits + misses > 0) ? (hits / (hits + misses)) : 0;
      evictedKeys = parseInt(stats.evicted_keys || '0');
      expiredKeys = parseInt(stats.expired_keys || '0');
      totalMemory = parseInt(stats.used_memory || '0');
      peakMemory = parseInt(stats.used_memory_peak || '0');

      // Análisis básico de patrones (Muestreo de 500 keys)
      const { keys } = await redisClient.scan(0, { COUNT: 500 });
      const patterns: Record<string, { count: number; totalSize: number }> = {};

      for (const key of keys) {
        const prefix = key.split(':')[0] || 'other';
        if (!patterns[prefix]) patterns[prefix] = { count: 0, totalSize: 0 };
        patterns[prefix].count++;
        // Estimación simple del tamaño si es string
        const val = await redisClient.get(key).catch(() => null);
        patterns[prefix].totalSize += val ? Buffer.byteLength(val) : 0;
      }

      keysByPattern = Object.entries(patterns).map(([pattern, data]) => ({
        pattern: `${pattern}:*`,
        count: data.count,
        memoryUsage: data.totalSize,
        avgTTL: 0 // Simplificado
      }));
    }

    res.json(ok({ keysByPattern, hitRate, evictedKeys, expiredKeys, totalMemory, peakMemory }));
  })
);

adminSystemRouter.get(
  '/redis/keys',
  asyncHandler(async (req: Request, res: Response) => {
    const pattern = String(req.query.pattern ?? '*');
    const cursor = Number(req.query.cursor ?? 0);
    const count = Number(req.query.count ?? 100);
    const { cursor: nextCursor, keys } = await redisClient.scan(cursor, { MATCH: pattern, COUNT: count });
    res.json(ok({ keys, cursor: nextCursor, total: keys.length }));
  })
);

adminSystemRouter.get(
  '/redis/keys/:key',
  asyncHandler(async (req: Request, res: Response) => {
    const key = req.params.key;
    const type = await redisClient.type(key);
    const ttl = await redisClient.ttl(key);
    let value: unknown = null;
    if (type === 'string') value = await redisClient.get(key);
    res.json(ok({ key, type, ttl, value }));
  })
);

adminSystemRouter.post(
  '/redis/keys',
  asyncHandler(async (req: Request, res: Response) => {
    const { key, value, ttl } = req.body as { key: string; value: string; ttl?: number };
    await redisClient.set(key, typeof value === 'string' ? value : JSON.stringify(value));
    if (ttl) await redisClient.expire(key, ttl);
    res.json(ok({ ok: true }));
  })
);

adminSystemRouter.delete(
  '/redis/keys/:key',
  asyncHandler(async (req: Request, res: Response) => {
    await redisClient.del(req.params.key);
    res.json(ok({ deleted: true }));
  })
);

adminSystemRouter.patch(
  '/redis/keys/:key/ttl',
  asyncHandler(async (req: Request, res: Response) => {
    const { ttl } = req.body as { ttl: number };
    await redisClient.expire(req.params.key, ttl);
    res.json(ok({ updated: true }));
  })
);

adminSystemRouter.get(
  '/redis/slowlog',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const limit = Number(req.query.limit ?? req.query.count ?? 10);
      if (!redisClient.isOpen) {
        return res.json(ok([]));
      }

      const logs = await (redisClient as unknown as { slowLogGet: (limit: number) => Promise<RedisSlowLogEntry[]> }).slowLogGet(limit);
      res.json(ok(logs.map((log: RedisSlowLogEntry) => ({
        id: log.id,
        timestamp: log.timestamp,
        duration: log.duration,
        command: log.args
      }))));
    } catch (error) {
      logError('[Redis] Error fetching slowlog (Command might not be supported):', error instanceof Error ? error : new Error(String(error)), 'SYSTEM');
      res.json(ok([])); // Return empty instead of 500
    }
  })
);

adminSystemRouter.get(
  '/redis/clients',
  asyncHandler(async (_req: Request, res: Response) => {
    try {
      if (!redisClient.isOpen) {
        return res.json(ok([]));
      }
      // Las versiones modernas de redis client devuelven un array de objetos
      const clients = await redisClient.clientList();
      res.json(ok(clients));
    } catch (error) {
      logError('[Redis] Error fetching client list:', error instanceof Error ? error : new Error(String(error)), 'SYSTEM');
      res.json(ok([]));
    }
  })
);

adminSystemRouter.delete(
  '/redis/clients/:id',
  asyncHandler(async (_req: Request, res: Response) => {
    res.json(ok({ killed: true }));
  })
);

adminSystemRouter.post(
  '/redis/flush',
  asyncHandler(async (req: Request, res: Response) => {
    const { confirm, password } = req.body as { confirm: string, password?: string };

    if (password !== env.adminPassword) {
      res.status(401).json({ message: 'Invalid admin password' });
      return;
    }

    if (!confirm) {
      res.status(400).json({ message: 'Confirm required' });
      return;
    }
    await redisClient.flushDb();
    res.json(ok({ flushed: true }));
  })
);

adminSystemRouter.post(
  '/redis/save',
  asyncHandler(async (_req: Request, res: Response) => {
    res.json(ok({ saved: true }));
  })
);

adminSystemRouter.get(
  '/redis/info',
  asyncHandler(async (_req: Request, res: Response) => {
    const info = await redisClient.info();
    res.json(ok(info));
  })
);
