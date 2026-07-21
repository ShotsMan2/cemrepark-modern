import redis from "./redis";
import logger from "./logger";

interface SlidingRecord {
  timestamps: number[];
}

interface RateLimitConfig {
  limit: number;
  windowMs: number;
  errorMessage?: string;
  errorCode?: number;
}

const endpointDefaults: Record<string, RateLimitConfig> = {
  auth: { limit: 10, windowMs: 300000, errorMessage: "Çok fazla giriş denemesi. Lütfen 5 dakika bekleyin.", errorCode: 429 },
  api: { limit: 100, windowMs: 60000, errorMessage: "API limiti aşıldı.", errorCode: 429 },
  orders: { limit: 30, windowMs: 60000, errorMessage: "Sipariş işlem limiti aşıldı.", errorCode: 429 },
  chat: { limit: 60, windowMs: 60000, errorMessage: "Mesaj gönderme limiti aşıldı.", errorCode: 429 },
  admin: { limit: 200, windowMs: 60000, errorMessage: "Admin işlem limiti aşıldı.", errorCode: 429 },
  default: { limit: 100, windowMs: 60000, errorMessage: "Çok fazla istek.", errorCode: 429 },
};

const whitelist = new Set<string>();
const memorySliding = new Map<string, SlidingRecord>();

const ipWhitelistVar = process.env.RATE_LIMIT_WHITELIST || "";
if (ipWhitelistVar) {
  ipWhitelistVar.split(",").forEach((ip) => whitelist.add(ip.trim()));
}

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memorySliding.entries()) {
    record.timestamps = record.timestamps.filter((t) => now - t < 60000);
    if (record.timestamps.length === 0) {
      memorySliding.delete(key);
    }
  }
}, 30000);

export function addToWhitelist(ip: string) {
  whitelist.add(ip);
}

export function removeFromWhitelist(ip: string) {
  whitelist.delete(ip);
}

function detectEndpointType(path: string): string {
  if (path.startsWith("/api/auth")) return "auth";
  if (path.startsWith("/api/orders")) return "orders";
  if (path.startsWith("/api/chat")) return "chat";
  if (path.startsWith("/api/admin")) return "admin";
  if (path.startsWith("/api/")) return "api";
  return "default";
}

export async function rateLimit(
  identifier: string,
  limitOrConfig?: number | RateLimitConfig,
  windowMs?: number
) {
  if (whitelist.has(identifier)) {
    return { success: true, limit: 0, remaining: Infinity, reset: 0 };
  }

  let config: RateLimitConfig;
  if (typeof limitOrConfig === "number") {
    config = { limit: limitOrConfig, windowMs: windowMs || 60000, errorMessage: "Çok fazla istek.", errorCode: 429 };
  } else if (limitOrConfig) {
    config = limitOrConfig;
  } else {
    const endpointType = detectEndpointType(identifier.split(":")[0]);
    config = endpointDefaults[endpointType] || endpointDefaults.default;
  }

  const windowSeconds = Math.ceil(config.windowMs / 1000);
  const now = Date.now();

  try {
    if (redis && (redis.status === "ready" || typeof redis.pipeline === "function")) {
      const key = `rate-limit:sliding:${identifier}`;
      const minScore = now - config.windowMs;

      const pipeline = redis.pipeline();
      pipeline.zremrangebyscore(key, 0, minScore);
      pipeline.zadd(key, now, `${now}:${Math.random()}`);
      pipeline.zcard(key);
      pipeline.expire(key, windowSeconds);
      const results = await pipeline.exec();

      if (results && results[2] && results[2][1]) {
        const current = results[2][1] as number;
        const oldestAllowed = now - config.windowMs;
        const ttl = windowSeconds;

        return {
          success: current <= config.limit,
          limit: config.limit,
          remaining: Math.max(0, config.limit - current),
          reset: ttl,
          retryAfter: current > config.limit ? Math.ceil((config.windowMs - (now - oldestAllowed)) / 1000) : 0,
          errorMessage: config.errorMessage,
        };
      }
      throw new Error("Redis sliding window failed");
    } else {
      throw new Error("Redis not ready");
    }
  } catch {
    if (logger?.error) {
      logger.error("Rate limit redis error, falling back to sliding memory:", { identifier });
    }

    let record = memorySliding.get(identifier);
    if (!record) {
      record = { timestamps: [] };
      memorySliding.set(identifier, record);
    }

    record.timestamps = record.timestamps.filter((t) => now - t < config.windowMs);
    record.timestamps.push(now);

    const current = record.timestamps.length;
    return {
      success: current <= config.limit,
      limit: config.limit,
      remaining: Math.max(0, config.limit - current),
      reset: Math.ceil(config.windowMs / 1000),
      retryAfter: current > config.limit ? Math.ceil((config.windowMs - (now - record.timestamps[0])) / 1000) : 0,
      errorMessage: config.errorMessage,
    };
  }
}

export function createRateLimiter(options: {
  limit?: number;
  windowMs?: number;
  endpointType?: string;
  errorMessage?: string;
  errorCode?: number;
  skip?: (req: any) => boolean;
}) {
  const config: RateLimitConfig = {
    limit: options.limit || 100,
    windowMs: options.windowMs || 60000,
    errorMessage: options.errorMessage || "Çok fazla istek.",
    errorCode: options.errorCode || 429,
  };

  return async (req: { headers?: any; nextUrl?: any; ip?: string } | any) => {
    if (options.skip && options.skip(req)) {
      return { success: true, limit: config.limit, remaining: Infinity, reset: 0 };
    }

    const ip =
      req.headers?.["x-forwarded-for"]?.split(",")?.[0]?.trim() ||
      req.ip ||
      "127.0.0.1";
    const endpoint = options.endpointType || detectEndpointType(req.nextUrl?.pathname || req.url || "");
    const identifier = `${endpoint}:${ip}`;

    const result = await rateLimit(identifier, config);
    return result;
  };
}
