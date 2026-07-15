import { validateCartStock } from '../src/utils/cartLogic';

describe('validateCartStock', () => {
  it('should return invalid if product is not provided', () => {
    const result = validateCartStock({}, 1, null);
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Ürün bulunamadı');
  });

  it('should return invalid if available stock is 0', () => {
    const product = { stok: 0 };
    const result = validateCartStock({}, 1, product);
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Ürün stokta yok');
  });

  it('should return invalid if requested quantity exceeds available stock', () => {
    const product = { stok: 5 };
    const result = validateCartStock({}, 6, product);
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Sadece 5 adet stok mevcuttur');
  });

  it('should return valid if requested quantity is within available stock', () => {
    const product = { stok: 5 };
    const result = validateCartStock({}, 3, product);
    expect(result.isValid).toBe(true);
    expect(result.message).toBe('Stok uygun');
  });

  it('should handle product variations correctly', () => {
    const product = {
      variations: [
        { renk: 'Kırmızı', beden: 'M', stok: 3 },
        { renk: 'Mavi', beden: 'L', stok: 0 }
      ]
    };

    // Valid variant
    const validResult = validateCartStock({ renk: 'Kırmızı', beden: 'M' }, 2, product);
    expect(validResult.isValid).toBe(true);

    // Out of stock variant
    const oosResult = validateCartStock({ renk: 'Mavi', beden: 'L' }, 1, product);
    expect(oosResult.isValid).toBe(false);

    // Missing variant
    const missingResult = validateCartStock({ renk: 'Yeşil', beden: 'S' }, 1, product);
    expect(missingResult.isValid).toBe(false);
    expect(missingResult.message).toBe('Seçili varyant bulunamadı');
  });
});
