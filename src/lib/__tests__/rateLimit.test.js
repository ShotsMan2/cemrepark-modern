import rateLimit from "../rateLimit";
import { LRUCache } from "lru-cache";

describe("rateLimit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should allow requests under the limit", async () => {
    const limiter = rateLimit({ uniqueTokenPerInterval: 500, interval: 60000 });
    const limit = 5;
    const token = "user_123";

    // Make 5 requests, which is exactly the limit
    await expect(limiter.check(limit, token)).resolves.toBeUndefined();
    await expect(limiter.check(limit, token)).resolves.toBeUndefined();
    await expect(limiter.check(limit, token)).resolves.toBeUndefined();
    await expect(limiter.check(limit, token)).resolves.toBeUndefined();
    await expect(limiter.check(limit, token)).resolves.toBeUndefined();
  });

  it("should reject requests over the limit", async () => {
    const limiter = rateLimit({ uniqueTokenPerInterval: 500, interval: 60000 });
    const limit = 2;
    const token = "user_456";

    // First two requests should pass
    await expect(limiter.check(limit, token)).resolves.toBeUndefined();
    await expect(limiter.check(limit, token)).resolves.toBeUndefined();

    // Third request should be rejected
    await expect(limiter.check(limit, token)).rejects.toBeUndefined();
  });

  it("should maintain separate limits for different tokens", async () => {
    const limiter = rateLimit({ uniqueTokenPerInterval: 500, interval: 60000 });
    const limit = 1;
    const token1 = "user_A";
    const token2 = "user_B";

    // user_A makes 1 request (passes)
    await expect(limiter.check(limit, token1)).resolves.toBeUndefined();

    // user_B makes 1 request (passes)
    await expect(limiter.check(limit, token2)).resolves.toBeUndefined();

    // user_A makes another request (rejected)
    await expect(limiter.check(limit, token1)).rejects.toBeUndefined();

    // user_B makes another request (rejected)
    await expect(limiter.check(limit, token2)).rejects.toBeUndefined();
  });

  it("should fallback to default options if not provided", async () => {
    // This will indirectly test if it creates without errors
    const limiter = rateLimit();
    await expect(limiter.check(10, "token")).resolves.toBeUndefined();
  });
});
