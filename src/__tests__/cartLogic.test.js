import { validateCartStock, calculateCartDiscounts } from "../utils/cartLogic";

describe("cartLogic", () => {
  describe("validateCartStock", () => {
    it("should fail if product is not found", () => {
      const result = validateCartStock({ id: 1 }, 1, null);
      expect(result).toEqual({ isValid: false, message: "Ürün bulunamadı", availableStock: 0 });
    });

    it("should fail if requested quantity exceeds product stock (no variants)", () => {
      const product = { stok: 5 };
      const cartItem = { id: 1 };
      const result = validateCartStock(cartItem, 6, product);
      expect(result).toEqual({
        isValid: false,
        message: "Sadece 5 adet stok mevcuttur",
        availableStock: 5,
      });
    });

    it("should succeed if requested quantity is within product stock (no variants)", () => {
      const product = { stok: 5 };
      const cartItem = { id: 1 };
      const result = validateCartStock(cartItem, 3, product);
      expect(result).toEqual({ isValid: true, message: "Stok uygun", availableStock: 5 });
    });

    it("should fail if requested quantity exceeds variant stock", () => {
      const product = {
        stok: 10,
        variations: [{ renk: "Kırmızı", beden: "M", stok: 2 }],
      };
      const cartItem = { id: 1, renk: "Kırmızı", beden: "M" };
      const result = validateCartStock(cartItem, 3, product);
      expect(result).toEqual({
        isValid: false,
        message: "Sadece 2 adet stok mevcuttur",
        availableStock: 2,
      });
    });

    it("should fail if selected variant is not found", () => {
      const product = {
        stok: 10,
        variations: [{ renk: "Kırmızı", beden: "M", stok: 2 }],
      };
      const cartItem = { id: 1, renk: "Mavi", beden: "M" };
      const result = validateCartStock(cartItem, 1, product);
      expect(result).toEqual({
        isValid: false,
        message: "Seçili varyant bulunamadı",
        availableStock: 0,
      });
    });

    it("should succeed if requested quantity is within variant stock", () => {
      const product = {
        stok: 10,
        variations: [{ renk: "Kırmızı", beden: "M", stok: 5 }],
      };
      const cartItem = { id: 1, renk: "Kırmızı", beden: "M" };
      const result = validateCartStock(cartItem, 4, product);
      expect(result).toEqual({ isValid: true, message: "Stok uygun", availableStock: 5 });
    });

    it("should fail if variant stock is 0", () => {
      const product = {
        stok: 10,
        variations: [{ renk: "Kırmızı", beden: "M", stok: 0 }],
      };
      const cartItem = { id: 1, renk: "Kırmızı", beden: "M" };
      const result = validateCartStock(cartItem, 1, product);
      expect(result).toEqual({ isValid: false, message: "Ürün stokta yok", availableStock: 0 });
    });
  });

  describe("calculateCartDiscounts", () => {
    it("should calculate subtotal correctly with no promotions or coupons", () => {
      const cartItems = [
        { fiyat: 100, quantity: 2 },
        { indirimliFiyat: 50, fiyat: 60, quantity: 1 },
      ];
      const result = calculateCartDiscounts(cartItems);
      expect(result.subtotal).toBe(250); // (100 * 2) + (50 * 1)
      expect(result.total).toBe(250);
      expect(result.discountAmount).toBe(0);
      expect(result.isFreeShipping).toBe(false);
      expect(result.appliedPromotions).toEqual([]);
    });

    it("should apply active percentage promotion with no condition", () => {
      const cartItems = [{ fiyat: 200, quantity: 1 }];
      const promotions = [
        { isActive: true, type: "PERCENTAGE_DISCOUNT", discountValue: 10, name: "%10 İndirim" },
      ];
      const result = calculateCartDiscounts(cartItems, promotions);
      expect(result.subtotal).toBe(200);
      expect(result.discountAmount).toBe(20);
      expect(result.total).toBe(180);
      expect(result.appliedPromotions).toContain("%10 İndirim");
    });

    it("should apply fixed discount coupon", () => {
      const cartItems = [{ fiyat: 200, quantity: 1 }];
      const coupon = { isActive: true, discountType: "FIXED", discountValue: 50 };
      const result = calculateCartDiscounts(cartItems, [], coupon);
      expect(result.subtotal).toBe(200);
      expect(result.discountAmount).toBe(50);
      expect(result.total).toBe(150);
    });

    it("should not apply coupon if minCartValue condition is not met", () => {
      const cartItems = [{ fiyat: 200, quantity: 1 }];
      const coupon = {
        isActive: true,
        discountType: "FIXED",
        discountValue: 50,
        minCartValue: 300,
      };
      const result = calculateCartDiscounts(cartItems, [], coupon);
      expect(result.subtotal).toBe(200);
      expect(result.discountAmount).toBe(0);
      expect(result.total).toBe(200);
    });

    it("should set free shipping flag correctly", () => {
      const cartItems = [{ fiyat: 100, quantity: 1 }];
      const promotions = [
        {
          isActive: true,
          type: "FREE_SHIPPING",
          conditionType: "MIN_CART_VALUE",
          conditionValue: 50,
          name: "Ücretsiz Kargo",
        },
      ];
      const result = calculateCartDiscounts(cartItems, promotions);
      expect(result.isFreeShipping).toBe(true);
      expect(result.appliedPromotions).toContain("Ücretsiz Kargo");
    });

    it("should not apply inactive or expired promotions", () => {
      const cartItems = [{ fiyat: 100, quantity: 1 }];
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      const promotions = [
        { isActive: false, type: "FIXED_DISCOUNT", discountValue: 10, name: "İnaktif" },
        {
          isActive: true,
          endDate: pastDate.toISOString(),
          type: "FIXED_DISCOUNT",
          discountValue: 10,
          name: "Süresi Dolmuş",
        },
        {
          isActive: true,
          startDate: futureDate.toISOString(),
          type: "FIXED_DISCOUNT",
          discountValue: 10,
          name: "Henüz Başlamamış",
        },
      ];
      const result = calculateCartDiscounts(cartItems, promotions);
      expect(result.discountAmount).toBe(0);
    });

    it("should cap total discount to subtotal", () => {
      const cartItems = [{ fiyat: 100, quantity: 1 }];
      const coupon = { isActive: true, discountType: "FIXED", discountValue: 150 };
      const result = calculateCartDiscounts(cartItems, [], coupon);
      expect(result.subtotal).toBe(100);
      expect(result.discountAmount).toBe(100);
      expect(result.total).toBe(0);
    });
  });
});
