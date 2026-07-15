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
