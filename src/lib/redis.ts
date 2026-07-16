import Redis from 'ioredis';

const globalForRedis = global as unknown as { redis: Redis };

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis =
  globalForRedis.redis ||
  new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    enableOfflineQueue: false,
    retryStrategy(times) {
      if (times > 3) {
        return null;
      }
      return Math.min(times * 50, 2000);
    },
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

redis.on('error', (err: any) => {
  if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
    // Ignore expected connection errors if Redis is not running locally
    return;
  }
  console.error('Redis Client Error:', err.message || err);
});

export const cacheGet = async (key: string) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err: any) {
    console.error('Redis cacheGet error:', err.message);
    return null;
  }
};

export const cacheSet = async (key: string, value: any, ttl = 300) => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  } catch (err: any) {
    console.error('Redis cacheSet error:', err.message);
  }
};

export const cacheDel = async (key: string) => {
  try {
    if (key.includes('*')) {
      const keys = await redis.keys(key);
      if (keys.length > 0) await redis.del(...keys);
    } else {
      await redis.del(key);
    }
  } catch (err: any) {
    console.error('Redis cacheDel error:', err.message);
  }
};

export default redis;
