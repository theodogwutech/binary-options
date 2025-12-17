import { createClient } from 'redis';
import { logger } from '../utils/logger';

let redisClient: ReturnType<typeof createClient> | null = null;

// Only create Redis client if REDIS_URL is provided
if (process.env.REDIS_URL) {
  redisClient = createClient({
    url: process.env.REDIS_URL,
  });

  redisClient.on('error', (err) => {
    logger.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    logger.info('Redis client connected');
  });

  redisClient.on('ready', () => {
    logger.info('Redis client ready');
  });
} else {
  logger.warn('Redis URL not provided - running without Redis cache');
}

export const connectRedis = async (): Promise<void> => {
  if (!redisClient) {
    logger.info('Redis is disabled - skipping connection');
    return;
  }

  try {
    await redisClient.connect();
    logger.info('Redis connected successfully');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    logger.warn('Continuing without Redis cache');
    redisClient = null;
  }
};

export default redisClient;
