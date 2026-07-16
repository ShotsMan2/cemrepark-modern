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
      let cursor = '0';
      do {
        const res = await redis.scan(cursor, 'MATCH', key, 'COUNT', 100);
        cursor = res[0];
        const keys = res[1];
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } while (cursor !== '0');
    } else {
      await redis.del(key);
    }
  } catch (err: any) {
    console.error('Redis cacheDel error:', err.message);
  }
};

export const fetchWithCache = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 300
): Promise<T> => {
  try {
    const cached = await cacheGet(key);
    if (cached !== null) return cached;
  } catch (e) {
    // ignore cache get error and fetch directly
  }

  const data = await fetcher();
  
  try {
    if (data !== null && data !== undefined) {
      await cacheSet(key, data, ttl);
    }
  } catch (e) {
    // ignore cache set error and return data
  }
  
  return data;
};

export default redis;
