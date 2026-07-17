import { prisma } from "../lib/prisma";

/**
 * Validates and calculates discounts based on active promotions.
 * 
 * @param {Array} cartItems - Array of items in the cart.
 * @param {number} cartTotal - Total cart value before discounts.
 * @returns {Promise<Object>} - The applied discount details.
 */
export async function calculatePromotions(cartItems, cartTotal) {
  try {
    const activePromotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: new Date() } }
        ],
        AND: [
          { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] }
        ]
      }
    });

    if (!activePromotions || activePromotions.length === 0) {
      return { discountAmount: 0, appliedPromotion: null };
    }

    let maxDiscount = 0;
    let appliedPromotion = null;

    // Evaluate each promotion to find the best discount for the user
    for (const promo of activePromotions) {
      let currentDiscount = 0;

      // Rule: PERCENTAGE_DISCOUNT on Total Cart
      if (promo.type === "PERCENTAGE_DISCOUNT") {
        if (promo.conditionType === "MIN_CART_VALUE" && cartTotal >= (promo.conditionValue || 0)) {
          currentDiscount = cartTotal * ((promo.discountValue || 0) / 100);
        }
      }
      
      // Rule: FREE_SHIPPING (Simulated as a fixed discount value equivalent to shipping cost, or just flag)
      if (promo.type === "FREE_SHIPPING") {
        if (promo.conditionType === "MIN_CART_VALUE" && cartTotal >= (promo.conditionValue || 0)) {
          // Assuming a standard shipping fee of 49.90
          currentDiscount = 49.90;
        }
      }

      // Rule: BUY_X_GET_Y (e.g. Buy 3 Pay 2)
      if (promo.type === "BUY_X_GET_Y") {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const conditionX = promo.conditionValue || 3; // e.g. Buy 3
        
        if (totalItems >= conditionX) {
          // Simplest approach: Sort items by price ascending, and discount the cheapest items
          const flatItems = [];
          cartItems.forEach(item => {
            for(let i=0; i<item.quantity; i++) flatItems.push(item.fiyat);
          });
          flatItems.sort((a, b) => a - b);
          
          // Calculate how many items are free
          const freeItemsCount = Math.floor(totalItems / conditionX);
          
          let freeValue = 0;
          for(let i=0; i<freeItemsCount; i++) {
            freeValue += flatItems[i];
          }
          currentDiscount = freeValue;
        }
      }

      // Track the best promotion
      if (currentDiscount > maxDiscount) {
        maxDiscount = currentDiscount;
        appliedPromotion = promo.name;
      }
    }

    // Ensure discount doesn't exceed cart total
    if (maxDiscount > cartTotal) {
      maxDiscount = cartTotal;
    }

    return { 
      discountAmount: parseFloat(maxDiscount.toFixed(2)), 
      appliedPromotion 
    };
    
  } catch (error) {
    console.error("Error calculating promotions:", error);
    return { discountAmount: 0, appliedPromotion: null };
  }
}
