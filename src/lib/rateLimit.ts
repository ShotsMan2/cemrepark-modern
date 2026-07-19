import { LRUCache } from "lru-cache";

interface RateLimitOptions {
  uniqueTokenPerInterval?: number;
  interval?: number;
}

export default function rateLimit(options?: RateLimitOptions) {
  const tokenCache = new LRUCache<string, number[]>({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) || [0])[0];
        if (tokenCount === 0) {
          tokenCache.set(token, [1]);
        } else {
          tokenCache.set(token, [tokenCount + 1]);
        }

        const currentUsage = tokenCount + 1;
        const isRateLimited = currentUsage > limit;

        return isRateLimited ? reject() : resolve();
      }),
  };
}
