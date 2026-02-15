import { redisClient } from '../config/redis.js';
import { logError } from '../utils/logger.js';

const ONE_DAY_SECONDS = 60 * 60 * 24;

export const getIpInfo = async (ip: string) => {
  if (!ip) return null;
  const cacheKey = `ipguide:${ip}`;

  if (redisClient.isOpen) {
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached) as Record<string, unknown>;
      }
    } catch (error) {
      logError('[IpGuide] Cache read failed:', error instanceof Error ? error : new Error(String(error)), 'DATABASE');
    }
  }

  const url = `https://ip.guide/${ip}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as Record<string, unknown>;

    if (redisClient.isOpen) {
      try {
        await redisClient.set(cacheKey, JSON.stringify(data), { EX: ONE_DAY_SECONDS });
      } catch (error) {
        logError('[IpGuide] Cache write failed:', error instanceof Error ? error : new Error(String(error)), 'DATABASE');
      }
    }
    return data;
  } catch (error) {
    logError('[IpGuide] Fetch error:', error instanceof Error ? error : new Error(String(error)), 'NETWORK');
    return null;
  }
};
