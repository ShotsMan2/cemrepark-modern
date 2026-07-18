/**
 * @jest-environment node
 */
import { rateLimit } from "@/lib/rate-limit";
import { logAuditAction } from "@/lib/auditLogger";

jest.mock("@/lib/auditLogger", () => ({
  logAuditAction: jest.fn(),
}));

jest.mock("@/lib/redis", () => ({
  __esModule: true,
  default: {
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    get: jest.fn().mockResolvedValue(null),
  },
  cacheGet: jest.fn(),
  cacheSet: jest.fn(),
  cacheDel: jest.fn(),
}));

describe("Auth Utilities", () => {
  it("should allow requests below the rate limit", async () => {
    const result = await rateLimit("test-ip-1", 5, 60);
    expect(result.success).toBe(true);
  });

  it("should log audit actions correctly", async () => {
    const params = {
      action: "TEST_ACTION",
      userId: 1,
      details: "test details",
      ipAddress: "127.0.0.1"
    };

    await logAuditAction(params);
    expect(logAuditAction).toHaveBeenCalledWith(params);
  });
});
