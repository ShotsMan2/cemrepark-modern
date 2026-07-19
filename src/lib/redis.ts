import Redis from 'ioredis';

const globalForRedis = global as unknown as { redis: Redis | null };

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let _redis: Redis | null = null;

function getRedis(): Redis {
  if (_redis && _redis.status !== 'end') return _redis;
  if (globalForRedis.redis && globalForRedis.redis.status !== 'end') {
    _redis = globalForRedis.redis;
    return _redis;
  }

  try {
    _redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      enableOfflineQueue: false,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 3) {
          return null;
        }
        return Math.min(times * 50, 2000);
      },
    });

    _redis.on('error', (err: any) => {
      if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
        return;
      }
      console.error('Redis Client Error:', err.message || err);
    });

    _redis.connect().catch(() => {});

    if (process.env.NODE_ENV !== 'production') {
      globalForRedis.redis = _redis;
    }
  } catch {
    // Redis unavailable - return a no-op stub
    _redis = null as any;
  }

  return _redis!;
}

export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    const instance = getRedis();
    if (!instance) {
      // Return no-op functions for common Redis methods
      return (..._args: any[]) => {
        if (prop === 'get' || prop === 'scan') return Promise.resolve(null);
        if (prop === 'status') return 'disconnected';
        return Promise.resolve(null);
      };
    }
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  },
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
