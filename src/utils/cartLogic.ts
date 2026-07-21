/**
 * Validates if an item can be added to the cart based on requested quantity and available stock.
 */
export interface CartItem {
  id?: string;
  renk?: string;
  beden?: string;
  indirimliFiyat?: number;
  fiyat?: number;
  quantity: number;
}

export interface ProductVariation {
  renk: string;
  beden: string;
  stok: number;
}

export interface Product {
  id?: string;
  stok?: number;
  variations?: ProductVariation[];
}

export interface StockValidationResult {
  isValid: boolean;
  message: string;
  availableStock: number;
}

/**
 * Validates if an item can be added to the cart based on requested quantity and available stock.
 * @param cartItem - The item being added to the cart
 * @param requestedQuantity - The quantity the user wants to add
 * @param product - The product from the database
 * @returns {StockValidationResult}
 */
export const validateCartStock = (
  cartItem: CartItem,
  requestedQuantity: number,
  product: Product | null | undefined
): StockValidationResult => {
  if (!product) {
    return { isValid: false, message: "Ürün bulunamadı", availableStock: 0 };
  }

  // Find the specific variant stock if sizes and colors are involved
  let availableStock = product.stok || 0;

  // Assuming product might have a variations array
  if (product.variations && Array.isArray(product.variations)) {
    const variant = product.variations.find(
      (v) => v.renk === cartItem.renk && v.beden === cartItem.beden
    );
    if (variant) {
      availableStock = variant.stok || 0;
    } else {
      return { isValid: false, message: "Seçili varyant bulunamadı", availableStock: 0 };
    }
  }

  if (availableStock <= 0) {
    return { isValid: false, message: "Ürün stokta yok", availableStock };
  }

  if (requestedQuantity > availableStock) {
    return {
      isValid: false,
      message: `Sadece ${availableStock} adet stok mevcuttur`,
      availableStock,
    };
  }

  return { isValid: true, message: "Stok uygun", availableStock };
};

export interface Promotion {
  name: string;
  isActive: boolean;
  startDate?: Date | string;
  endDate?: Date | string;
  conditionType?: "MIN_CART_VALUE" | "MIN_ITEM_COUNT";
  conditionValue?: number;
  type: "FREE_SHIPPING" | "PERCENTAGE_DISCOUNT" | "FIXED_DISCOUNT" | "BUY_X_GET_Y";
  discountValue?: number;
}

export interface Coupon {
  isActive: boolean;
  minCartValue?: number;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
}

export interface CartDiscountResult {
  subtotal: number;
  discountAmount: number;
  total: number;
  isFreeShipping: boolean;
  appliedPromotions: string[];
}

/**
 * Calculates discounts based on active promotions and coupons.
 * @param cartItems - Array of cart items
 * @param promotions - Array of active promotions
 * @param coupon - Applied coupon object (optional)
 * @returns {CartDiscountResult} Discount details
 */
export const calculateCartDiscounts = (
  cartItems: CartItem[],
  promotions: Promotion[] = [],
  coupon: Coupon | null = null
): CartDiscountResult => {
  let subtotal = 0;
  let totalItemCount = 0;

  cartItems.forEach((item) => {
    subtotal += (item.indirimliFiyat || item.fiyat || 0) * item.quantity;
    totalItemCount += item.quantity;
  });

  let discountAmount = 0;
  let appliedPromotions: string[] = [];
  let isFreeShipping = false;

  // Apply automatic promotions
  if (promotions && promotions.length > 0) {
    promotions.forEach((promo) => {
      if (!promo.isActive) return;
      if (promo.startDate && new Date() < new Date(promo.startDate)) return;
      if (promo.endDate && new Date() > new Date(promo.endDate)) return;

      let conditionMet = false;
      if (promo.conditionType === "MIN_CART_VALUE" && subtotal >= (promo.conditionValue || 0)) {
        conditionMet = true;
      } else if (
        promo.conditionType === "MIN_ITEM_COUNT" &&
        totalItemCount >= (promo.conditionValue || 0)
      ) {
        conditionMet = true;
      } else if (!promo.conditionType) {
        conditionMet = true;
      }

      if (conditionMet) {
        if (promo.type === "FREE_SHIPPING") {
          isFreeShipping = true;
          appliedPromotions.push(promo.name);
        } else if (promo.type === "PERCENTAGE_DISCOUNT") {
          const discount = subtotal * ((promo.discountValue || 0) / 100);
          discountAmount += discount;
          appliedPromotions.push(promo.name);
        } else if (promo.type === "FIXED_DISCOUNT") {
          discountAmount += promo.discountValue || 0;
          appliedPromotions.push(promo.name);
        } else if (promo.type === "BUY_X_GET_Y") {
          if (totalItemCount >= (promo.conditionValue || 0)) {
            discountAmount += promo.discountValue || 0;
            appliedPromotions.push(promo.name);
          }
        }
      }
    });
  }

  // Apply Coupon
  if (coupon && coupon.isActive) {
    let couponMet = true;
    if (coupon.minCartValue && subtotal < coupon.minCartValue) {
      couponMet = false;
    }
    if (couponMet) {
      if (coupon.discountType === "PERCENTAGE") {
        discountAmount += subtotal * (coupon.discountValue / 100);
      } else if (coupon.discountType === "FIXED") {
        discountAmount += coupon.discountValue;
      }
    }
  }

  if (discountAmount > subtotal) discountAmount = subtotal;

  return {
    subtotal,
    discountAmount,
    total: subtotal - discountAmount,
    isFreeShipping,
    appliedPromotions,
  };
};
