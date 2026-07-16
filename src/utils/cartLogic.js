/**
 * Validates if an item can be added to the cart based on requested quantity and available stock.
 * @param {Object} cartItem - The item being added to the cart
 * @param {number} requestedQuantity - The quantity the user wants to add
 * @param {Object} product - The product from the database
 * @returns {Object} { isValid: boolean, message: string, availableStock: number }
 */
export const validateCartStock = (cartItem, requestedQuantity, product) => {
  if (!product) {
    return { isValid: false, message: 'Ürün bulunamadı', availableStock: 0 };
  }

  // Find the specific variant stock if sizes and colors are involved
  let availableStock = product.stok || 0;

  // Assuming product might have a variations array
  if (product.variations && Array.isArray(product.variations)) {
    const variant = product.variations.find(v => v.renk === cartItem.renk && v.beden === cartItem.beden);
    if (variant) {
      availableStock = variant.stok || 0;
    } else {
      return { isValid: false, message: 'Seçili varyant bulunamadı', availableStock: 0 };
    }
  }

  if (availableStock <= 0) {
    return { isValid: false, message: 'Ürün stokta yok', availableStock };
  }

  if (requestedQuantity > availableStock) {
    return { isValid: false, message: `Sadece ${availableStock} adet stok mevcuttur`, availableStock };
  }

  return { isValid: true, message: 'Stok uygun', availableStock };
};

/**
 * Calculates discounts based on active promotions and coupons.
 * @param {Array} cartItems - Array of cart items
 * @param {Array} promotions - Array of active promotions
 * @param {Object} coupon - Applied coupon object (optional)
 * @returns {Object} Discount details
 */
export const calculateCartDiscounts = (cartItems, promotions = [], coupon = null) => {
  let subtotal = 0;
  let totalItemCount = 0;
  
  cartItems.forEach(item => {
    subtotal += (item.indirimliFiyat || item.fiyat || 0) * item.quantity;
    totalItemCount += item.quantity;
  });
  
  let discountAmount = 0;
  let appliedPromotions = [];
  let isFreeShipping = false;

  // Apply automatic promotions
  if (promotions && promotions.length > 0) {
    promotions.forEach(promo => {
      if (!promo.isActive) return;
      if (promo.startDate && new Date() < new Date(promo.startDate)) return;
      if (promo.endDate && new Date() > new Date(promo.endDate)) return;

      let conditionMet = false;
      if (promo.conditionType === 'MIN_CART_VALUE' && subtotal >= (promo.conditionValue || 0)) {
        conditionMet = true;
      } else if (promo.conditionType === 'MIN_ITEM_COUNT' && totalItemCount >= (promo.conditionValue || 0)) {
        conditionMet = true;
      } else if (!promo.conditionType) {
        conditionMet = true;
      }

      if (conditionMet) {
        if (promo.type === 'FREE_SHIPPING') {
          isFreeShipping = true;
          appliedPromotions.push(promo.name);
        } else if (promo.type === 'PERCENTAGE_DISCOUNT') {
          const discount = subtotal * ((promo.discountValue || 0) / 100);
          discountAmount += discount;
          appliedPromotions.push(promo.name);
        } else if (promo.type === 'FIXED_DISCOUNT') {
          discountAmount += (promo.discountValue || 0);
          appliedPromotions.push(promo.name);
        } else if (promo.type === 'BUY_X_GET_Y') {
          // BUY_X_GET_Y requires conditionValue (X) and discountValue (Y)
          // Simple logic: If you have X items, you get a discount equivalent to Y items
          // Assuming conditionValue is X, and it applies a percentage off or fixed.
          if (totalItemCount >= (promo.conditionValue || 0)) {
             discountAmount += (promo.discountValue || 0);
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
      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount += subtotal * (coupon.discountValue / 100);
      } else if (coupon.discountType === 'FIXED') {
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
    appliedPromotions
  };
};
