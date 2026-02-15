import { createClient, RedisClientType } from 'redis';
import { env } from './env.js';
import logger, { logError } from '../utils/logger.js';

const originalRedisClient = createClient({
  url: env.redisUrl,
});

// Aislamiento de Redis: Prefijado automático de llaves por PROJECT_ID
const PROJECT_PREFIX = `${env.projectId}:`;

export const redisClient = new Proxy(originalRedisClient, {
  get(target: RedisClientType, prop: string | symbol) {
    const value = Reflect.get(target, prop);

    // Lista de métodos que operan sobre llaves individuales (el primer argumento es la llave)
    const keyMethods = [
      'get', 'set', 'del', 'exists', 'expire', 'ttl', 'incr', 'decr',
      'sAdd', 'sRem', 'sIsMember', 'sCard', 'sMembers', 'sPop',
      'hSet', 'hGet', 'hDel', 'hGetAll', 'hKeys', 'hExists', 'hIncrBy',
      'lPush', 'rPush', 'lPop', 'rPop', 'lRange', 'lLen', 'lIndex'
    ];

    if (typeof value === 'function') {
      return (...args: unknown[]) => {
        // Manejo de SCAN
        if (prop === 'scan') {
          const cursor = args[0];
          const options = (args[1] || {}) as { MATCH?: string; COUNT?: number };
          if (options.MATCH && typeof options.MATCH === 'string' && !options.MATCH.startsWith(PROJECT_PREFIX)) {
            options.MATCH = `${PROJECT_PREFIX}${options.MATCH}`;
          } else if (!options.MATCH) {
            options.MATCH = `${PROJECT_PREFIX}*`;
          }
          return value.call(target, cursor, options);
        }

        // Manejo de comandos con múltiples llaves como primer set de argumentos (del, mGet, mSet, etc)
        if (prop === 'del' || prop === 'unlink') {
          const prefixedArgs = args.map(arg =>
            typeof arg === 'string' && !arg.startsWith(PROJECT_PREFIX) ? `${PROJECT_PREFIX}${arg}` : arg
          );
          return value.apply(target, prefixedArgs);
        }

        // Métodos estándar donde el primer argumento es la llave
        if (keyMethods.includes(prop as string)) {
          if (args.length > 0 && typeof args[0] === 'string' && !args[0].startsWith(PROJECT_PREFIX)) {
            args[0] = `${PROJECT_PREFIX}${args[0]}`;
          }
          return value.apply(target, args);
        }

        return value.apply(target, args);
      };
    }
    return value;
  }
}) as RedisClientType;

redisClient.on('error', (err: Error) => logError('Redis error:', err, 'DATABASE'));

export const connectRedis = async () => {
  if (!originalRedisClient.isOpen) {
    try {
      logger.info(`[Redis] Connecting (${env.projectId})...`, { module: 'DATABASE' });
      await originalRedisClient.connect();
      logger.info(`[Redis] ✅ Connected to ${env.redisUrl.substring(0, 15)} (Namespace: ${env.projectId})`, { module: 'DATABASE' });
    } catch (error) {
      logError('[Redis] ❌ Connection failed:', error instanceof Error ? error : new Error(String(error)), 'DATABASE');
    }
  }
};
