import redis from './redis';
import logger from './logger';

export async function rateLimit(ip, limit = 100, windowSec = 60) {
  const key = `rate-limit:${ip}`;
  try {
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, windowSec);
    }
    
    return {
      success: current <= limit,
      limit,
      remaining: Math.max(0, limit - current),
      reset: windowSec,
    };
  } catch (error) {
    if (logger && logger.error) {
      logger.error("Rate limit redis error:", { error: error.message });
    }
    return {
      success: true,
      limit,
      remaining: 1,
      reset: windowSec,
    };
  }
}
