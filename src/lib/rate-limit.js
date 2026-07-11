import redis from './redis';

export async function rateLimit(ip, limit = 100, windowSec = 60) {
  const key = `rate-limit:${ip}`;
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
}
