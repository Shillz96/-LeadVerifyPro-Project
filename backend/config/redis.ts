import Redis from 'ioredis';
import logger from '../utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

class RedisClient {
  private static instance: Redis | null = null;
  private client: Redis;

  private constructor() {
    this.client = new Redis(REDIS_URL, {
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      logger.info('Redis Client Connected');
    });
  }

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      const client = new RedisClient();
      RedisClient.instance = client.client;
    }
    return RedisClient.instance;
  }
}

export default RedisClient.getInstance(); 