import redis from './redis';
import logger from './logger';

const memoryCache = new Map();

// Clean up memory cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memoryCache.entries()) {
    if (record.resetTime < now) {
      memoryCache.delete(key);
    }
  }
}, 60000);

export async function rateLimit(ip, limit = 100, windowSec = 60) {
  const key = `rate-limit:${ip}`;
  const now = Date.now();

  try {
    if (redis && (redis.status === 'ready' || typeof redis.pipeline === 'function')) {
      const pipeline = redis.pipeline();
      pipeline.incr(key);
      pipeline.ttl(key);
      const results = await pipeline.exec();
      
      const current = results[0][1];
      let ttl = results[1][1];
      
      if (ttl === -1 || ttl === -2) {
        await redis.expire(key, windowSec);
        ttl = windowSec;
      }
      
      return {
        success: current <= limit,
        limit,
        remaining: Math.max(0, limit - current),
        reset: ttl,
      };
    } else {
      throw new Error("Redis not ready");
    }
  } catch (error) {
    // In-memory fallback
    if (logger && logger.error && error.message !== "Redis not ready") {
      logger.error("Rate limit redis error, falling back to memory:", { error: error.message });
    }
    
    let record = memoryCache.get(key);
    if (!record || record.resetTime < now) {
      record = { count: 0, resetTime: now + windowSec * 1000 };
    }
    
    record.count += 1;
    memoryCache.set(key, record);
    
    return {
      success: record.count <= limit,
      limit,
      remaining: Math.max(0, limit - record.count),
      reset: Math.ceil((record.resetTime - now) / 1000),
    };
  }
}
