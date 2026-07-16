import redis from '../redis';

class RedisCache {
  async get(key) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Redis Get Error for key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttl = null) {
    try {
      const data = JSON.stringify(value);
      if (ttl) {
        // ttl is in milliseconds, convert to seconds for Redis EX
        await redis.set(key, data, 'EX', Math.floor(ttl / 1000));
      } else {
        await redis.set(key, data);
      }
    } catch (error) {
      console.error(`Redis Set Error for key ${key}:`, error);
    }
  }

  async delete(key) {
    try {
      await redis.del(key);
    } catch (error) {
      console.error(`Redis Delete Error for key ${key}:`, error);
    }
  }
}

export default new RedisCache();
