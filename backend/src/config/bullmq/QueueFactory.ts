import { Queue, ConnectionOptions } from 'bullmq';
import IORedis from 'ioredis';
import { RedisOptions } from 'ioredis';
import { env } from '../env.js';

export class QueueFactory {
    private static redisConnection: IORedis.default;

    public static getRedisConfig(): RedisOptions {
        if (env.redisUrl && !env.redisUrl.includes('localhost')) {
            return {
                maxRetriesPerRequest: null, // Required by BullMQ
            } as RedisOptions;
        }

        return {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            password: process.env.REDIS_PASSWORD || undefined,
            maxRetriesPerRequest: null, // Required by BullMQ
        };
    }

    public static getRedisConnection(): IORedis.default {
        if (!this.redisConnection) {
            if (env.redisUrl && !env.redisUrl.includes('localhost')) {
                // @ts-expect-error - IORedis types
                this.redisConnection = new IORedis(env.redisUrl, this.getRedisConfig());
            } else {
                // @ts-expect-error - IORedis types
                this.redisConnection = new IORedis(this.getRedisConfig());
            }
        }
        return this.redisConnection;
    }

    public static getQueue(name: string): Queue {
        const connection = this.getRedisConnection();

        const defaultJobOptions = {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
            removeOnComplete: {
                age: 24 * 3600, // Mantener por 24 horas
                count: 1000,
            },
            removeOnFail: {
                age: 7 * 24 * 3600, // Mantener fallidos por una semana
            }
        };

        return new Queue(name, {
            connection: connection as ConnectionOptions,
            defaultJobOptions,
        });
    }

    public static async closeConnection(): Promise<void> {
        if (this.redisConnection) {
            await this.redisConnection.quit();
        }
    }
}
