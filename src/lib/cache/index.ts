import logger from "../logger";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  staleAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
}

class MemoryCacheLayer {
  private store: Map<string, CacheEntry<unknown>>;
  private stats: CacheStats;
  private warmingQueue: Map<string, Promise<unknown>>;

  constructor() {
    this.store = new Map();
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
    this.warmingQueue = new Map();
    this.startCleanup();
  }

  private startCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (entry.expiresAt < now) {
          this.store.delete(key);
        }
      }
    }, 60000);
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      this.stats.misses++;
      return null;
    }
    this.stats.hits++;
    return entry.data as T;
  }

  async getStaleWhileRevalidate<T>(key: string, fetcher: () => Promise<T>, ttl: number): Promise<T> {
    const entry = this.store.get(key);
    const now = Date.now();

    if (entry) {
      if (entry.expiresAt > now) {
        this.stats.hits++;
        return entry.data as T;
      }
      if (entry.staleAt > now) {
        this.stats.hits++;
        this.revalidate(key, fetcher, ttl);
        return entry.data as T;
      }
    }

    this.stats.misses++;
    return this.set(key, await fetcher(), ttl);
  }

  async set<T>(key: string, value: T, ttl: number = 300): Promise<T> {
    const now = Date.now();
    this.store.set(key, {
      data: value,
      expiresAt: now + ttl * 1000,
      staleAt: now + ttl * 1000 * 2,
    });
    this.stats.sets++;
    return value;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
    this.stats.deletes++;
  }

  async deletePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        this.stats.deletes++;
      }
    }
  }

  async warm<T>(key: string, fetcher: () => Promise<T>, ttl: number = 300): Promise<void> {
    if (this.warmingQueue.has(key)) return;
    const promise = fetcher()
      .then((data) => this.set(key, data, ttl))
      .catch((err) => logger.error(`Cache warming failed for ${key}`, err))
      .finally(() => this.warmingQueue.delete(key));
    this.warmingQueue.set(key, promise);
  }

  private async revalidate<T>(key: string, fetcher: () => Promise<T>, ttl: number): Promise<void> {
    if (this.warmingQueue.has(key)) return;
    const promise = fetcher()
      .then((data) => this.set(key, data, ttl))
      .catch(() => {})
      .finally(() => this.warmingQueue.delete(key));
    this.warmingQueue.set(key, promise);
  }

  async clear(): Promise<void> {
    this.store.clear();
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }

  getStats(): CacheStats & { size: number } {
    return { ...this.stats, size: this.store.size };
  }
}

const memoryCache = new MemoryCacheLayer();
export default memoryCache;
