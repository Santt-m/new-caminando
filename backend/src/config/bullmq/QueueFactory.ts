import { Queue, ConnectionOptions } from 'bullmq';
import IORedis from 'ioredis';
import { RedisOptions } from 'ioredis';

export class QueueFactory {
    private static redisConnection: IORedis.default;

    public static getRedisConfig(): RedisOptions {
        return {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            password: process.env.REDIS_PASSWORD || undefined,
            maxRetriesPerRequest: null, // Requerido por BullMQ
        };
    }

    public static getRedisConnection(): IORedis.default {
        if (!this.redisConnection) {
            // @ts-expect-error - IORedis types can be tricky with ESM
            this.redisConnection = new IORedis(this.getRedisConfig());
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
