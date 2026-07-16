import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Prevent creating multiple connections in development
const globalForRedis = global;

/** @type {import('ioredis').Redis} */
export const redis =
  globalForRedis.redis ||
  new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

/**
 * Cache a Prisma query result in Redis
 * @param {string} key - Cache key
 * @param {Function} fetcher - Function returning a promise to fetch data if not in cache
 * @param {number} ttl - Time to live in seconds (default: 3600 = 1 hour)
 * @returns {Promise<any>}
 */
export async function getCachedData(key, fetcher, ttl = 3600) {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Redis GET Error:', error);
  }

  const data = await fetcher();

  try {
    if (data) {
      await redis.setex(key, ttl, JSON.stringify(data));
    }
  } catch (error) {
    console.error('Redis SET Error:', error);
  }

  return data;
}

/**
 * Invalidate a specific cache key or keys matching a pattern
 * @param {string} pattern - Key pattern (e.g., 'products:*')
 */
export async function invalidateCache(pattern) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Redis DEL Error:', error);
  }
}
