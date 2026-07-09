import { LRUCache } from 'lru-cache';

class MemoryCache {
  constructor() {
    this.cache = new LRUCache({
      max: 500,
      ttl: 1000 * 60 * 5, // 5 minutes
    });
  }

  async get(key) {
    return this.cache.get(key);
  }

  async set(key, value, ttl = null) {
    if (ttl) {
      this.cache.set(key, value, { ttl });
    } else {
      this.cache.set(key, value);
    }
  }

  async delete(key) {
    this.cache.delete(key);
  }
}

export default new MemoryCache();
