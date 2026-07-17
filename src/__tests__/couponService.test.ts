import { couponService } from "@/services/couponService";
import prisma from "@/lib/prisma";

// Mock the prisma client
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    coupon: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("CouponService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return invalid if code is not provided", async () => {
    const result = await couponService.validateCoupon("", 100);
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Kupon kodu gerekli");
  });

  it("should return invalid if coupon is not found", async () => {
    (prisma.coupon.findUnique as jest.Mock).mockResolvedValue(null);
    const result = await couponService.validateCoupon("INVALID", 100);
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Geçersiz kupon kodu");
  });

  it("should calculate PERCENTAGE discount correctly", async () => {
    (prisma.coupon.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      code: "DISCOUNT10",
      isActive: true,
      expiresAt: new Date(Date.now() + 100000), // future
      maxUses: null,
      usedCount: 0,
      minCartValue: 50,
      discountType: "PERCENTAGE",
      discountValue: 10,
    });

    const result = await couponService.validateCoupon("DISCOUNT10", 200);
    expect(result.valid).toBe(true);
    // 10% of 200 is 20
    expect(result.discountAmount).toBe(20);
  });

  it("should fail if cart total is below minCartValue", async () => {
    (prisma.coupon.findUnique as jest.Mock).mockResolvedValue({
      id: 2,
      code: "MIN100",
      isActive: true,
      expiresAt: null,
      maxUses: null,
      usedCount: 0,
      minCartValue: 100,
      discountType: "FIXED",
      discountValue: 20,
    });

    const result = await couponService.validateCoupon("MIN100", 50);
    expect(result.valid).toBe(false);
    expect(result.message).toContain("sepet tutarı en az 100 TL olmalıdır");
  });
});
