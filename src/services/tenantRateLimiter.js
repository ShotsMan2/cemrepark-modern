import logger from "../lib/logger";

export class TenantRateLimiter {
  constructor() {
    // In a real scenario, this uses Redis to store buckets per tenant
    this.buckets = new Map();
  }

  /**
   * Checks if a tenant has exceeded their API rate limit using a Token Bucket algorithm
   * @param {string} tenantId
   * @param {number} capacity max requests per window
   * @param {number} refillRate tokens added per second
   * @returns {boolean} allowed
   */
  async checkLimit(tenantId, capacity = 1000, refillRate = 10) {
    const now = Date.now();
    let bucket = this.buckets.get(tenantId);

    if (!bucket) {
      bucket = { tokens: capacity, lastRefill: now };
      this.buckets.set(tenantId, bucket);
    }

    // Refill tokens
    const timePassed = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(capacity, bucket.tokens + timePassed * refillRate);
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true; // Request allowed
    }

    logger.warn(`[Rate Limiter] Tenant ${tenantId} has exceeded API rate limit!`);
    return false; // Rate limit exceeded
  }
}

export const tenantRateLimiter = new TenantRateLimiter();
