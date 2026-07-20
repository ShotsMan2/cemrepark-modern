import prisma from "../lib/prisma";
import logger from "../lib/logger";

export async function syncCart(userId, localCartItems) {
  try {
    logger.info(`[Cart Service] Synchronizing cart for User ID: ${userId}`);

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } },
      });
    }

    if (localCartItems && localCartItems.length > 0) {
      const mergedItems = await mergeCartItems(cart.items, localCartItems);

      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

      for (const item of mergedItems) {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity,
            variantId: item.variantId || null,
            color: item.color || null,
            size: item.size || null,
          },
        });
      }

      cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
      });
    }

    return cart;
  } catch (error) {
    logger.error(`[Cart Service] Failed to synchronize cart for User ID: ${userId}`, error);
    throw error;
  }
}

async function mergeCartItems(dbItems, localItems) {
  const itemMap = new Map();

  for (const item of dbItems) {
    const key = `${item.productId}-${item.variantId || ""}-${item.color || ""}-${item.size || ""}`;
    itemMap.set(key, { ...item, source: "db" });
  }

  for (const item of localItems) {
    const key = `${item.productId}-${item.variantId || ""}-${item.color || ""}-${item.size || ""}`;
    if (itemMap.has(key)) {
      const existing = itemMap.get(key);
      existing.quantity = Math.max(existing.quantity, item.quantity);
    } else {
      itemMap.set(key, { ...item, source: "local" });
    }
  }

  return Array.from(itemMap.values()).map(({ productId, quantity, variantId, color, size }) => ({
    productId: typeof productId === "object" ? productId.id : productId,
    quantity,
    variantId: variantId || null,
    color: color || null,
    size: size || null,
  }));
}

export async function addToCart(userId, productId, quantity = 1, variantId = null, color = null, size = null) {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: true },
      });
    }

    const existingItem = cart.items.find(
      (i) =>
        i.productId === productId &&
        (i.variantId || null) === (variantId || null) &&
        (i.color || null) === (color || null) &&
        (i.size || null) === (size || null)
    );

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          variantId,
          color,
          size,
        },
      });
    }

    return prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
  } catch (error) {
    logger.error("[Cart Service] Failed to add item to cart", error);
    throw error;
  }
}

export async function removeFromCart(userId, cartItemId) {
  try {
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
  } catch (error) {
    logger.error("[Cart Service] Failed to remove item from cart", error);
    throw error;
  }
}

export async function updateCartItemQuantity(userId, cartItemId, quantity) {
  try {
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: Math.max(1, quantity) },
    });

    return prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
  } catch (error) {
    logger.error("[Cart Service] Failed to update cart item quantity", error);
    throw error;
  }
}

export async function clearCart(userId) {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return { success: true };
  } catch (error) {
    logger.error("[Cart Service] Failed to clear cart", error);
    throw error;
  }
}

export async function getCart(userId) {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    return cart || { id: null, userId, items: [] };
  } catch (error) {
    logger.error("[Cart Service] Failed to get cart", error);
    throw error;
  }
}

export async function recalculateCart(userId) {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) return { total: 0, items: [] };

    let total = 0;
    for (const item of cart.items) {
      if (item.product) {
        total += item.product.fiyat * item.quantity;
      }
    }

    return { items: cart.items, total, itemCount: cart.items.length };
  } catch (error) {
    logger.error("[Cart Service] Failed to recalculate cart", error);
    throw error;
  }
}

export async function validateCartStock(userId) {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) return { valid: true, errors: [] };

    const errors = [];
    for (const item of cart.items) {
      if (item.product && item.product.stok < item.quantity) {
        errors.push({
          productId: item.productId,
          productName: item.product.ad,
          available: item.product.stok,
          requested: item.quantity,
        });
      }
    }

    return { valid: errors.length === 0, errors };
  } catch (error) {
    logger.error("[Cart Service] Failed to validate cart stock", error);
    throw error;
  }
}

export async function applyCoupon(userId, couponCode) {
  try {
    const { default: prisma } = await import("../lib/prisma");

    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
    });

    if (!coupon) {
      return { valid: false, error: "Kupon kodu bulunamadı" };
    }

    if (!coupon.isActive) {
      return { valid: false, error: "Kupon kodu aktif değil" };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { valid: false, error: "Kupon kodunun süresi dolmuş" };
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, error: "Kupon kodu maksimum kullanım sayısına ulaşmış" };
    }

    const cart = await recalculateCart(userId);

    if (coupon.minCartValue && cart.total < coupon.minCartValue) {
      return {
        valid: false,
        error: `Minimum sepet tutarı: ${coupon.minCartValue} TL`,
        minCartValue: coupon.minCartValue,
      };
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (cart.total * coupon.discountValue) / 100;
    } else if (coupon.discountType === "FIXED") {
      discountAmount = Math.min(coupon.discountValue, cart.total);
    }

    return {
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discountAmount,
      totalAfterDiscount: cart.total - discountAmount,
    };
  } catch (error) {
    logger.error("[Cart Service] Failed to apply coupon", error);
    return { valid: false, error: "Kupon uygulanamadı" };
  }
}

export async function findAbandonedCarts(hoursThreshold = 24) {
  try {
    const threshold = new Date();
    threshold.setHours(threshold.getHours() - hoursThreshold);

    const abandonedCarts = await prisma.cart.findMany({
      where: {
        updatedAt: { lt: threshold },
        items: { some: {} },
      },
      include: {
        items: { include: { product: { select: { ad: true } } } },
        user: { select: { email: true, name: true } },
      },
    });

    return abandonedCarts;
  } catch (error) {
    logger.error("[Cart Service] Failed to find abandoned carts", error);
    return [];
  }
}
