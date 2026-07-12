import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(redisUrl, {
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

redis.on('error', (err) => {
  console.error('Redis Client Error:', err.message);
});

export default redis;
