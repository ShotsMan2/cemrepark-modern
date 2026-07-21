import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

class CouponService {
  /**
   * Validate a coupon code against a cart total
   * @param {string} code - The coupon code to validate
   * @param {number} cartTotal - The total value of the cart
   * @returns {Promise<{ valid: boolean, discountAmount: number, message: string }>}
   */
  async validateCoupon(code, cartTotal) {
    if (!code) {
      return { valid: false, discountAmount: 0, message: "Kupon kodu gerekli" };
    }

    try {
      const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (!coupon) {
        return { valid: false, discountAmount: 0, message: "Geçersiz kupon kodu" };
      }

      if (!coupon.isActive) {
        return { valid: false, discountAmount: 0, message: "Bu kupon artık aktif değil" };
      }

      if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
        return { valid: false, discountAmount: 0, message: "Kuponun süresi dolmuş" };
      }

      if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
        return { valid: false, discountAmount: 0, message: "Kupon kullanım sınırına ulaştı" };
      }

      if (coupon.minCartValue && cartTotal < coupon.minCartValue) {
        return {
          valid: false,
          discountAmount: 0,
          message: `Bu kuponu kullanmak için sepet tutarı en az ${coupon.minCartValue} TL olmalıdır`,
        };
      }

      let discountAmount = 0;
      if (coupon.discountType === "PERCENTAGE") {
        discountAmount = (cartTotal * coupon.discountValue) / 100;
      } else if (coupon.discountType === "FIXED") {
        discountAmount = coupon.discountValue;
      }

      // Discount cannot exceed the cart total
      if (discountAmount > cartTotal) {
        discountAmount = cartTotal;
      }

      return {
        valid: true,
        discountAmount,
        message: "Kupon başarıyla uygulandı",
        couponId: coupon.id,
        code: coupon.code,
      };
    } catch (error) {
      logger.error("Error validating coupon:", { error: error.message });
      throw new Error("Kupon doğrulanırken bir hata oluştu");
    }
  }

  /**
   * Mark a coupon as used
   * @param {number} couponId
   */
  async incrementCouponUsage(couponId) {
    try {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    } catch (error) {
      logger.error("Error incrementing coupon usage:", { error: error.message });
    }
  }
}

export const couponService = new CouponService();
