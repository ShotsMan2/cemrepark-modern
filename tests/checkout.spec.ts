import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('should complete a successful checkout', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Wait for products to load and add first product to cart
    // Note: Assuming there's a button or link to add to cart
    // If we need to go to product detail first:
    const firstProduct = page.locator('a[href^="/urundetay/"]').first();
    await firstProduct.waitFor({ state: 'visible' });
    await firstProduct.click();

    // On product detail page, click add to cart
    const addToCartBtn = page.getByRole('button', { name: /Sepete Ekle/i });
    await addToCartBtn.waitFor({ state: 'visible' });
    await addToCartBtn.click();

    // Go to checkout
    await page.goto('/checkout');

    // Fill the checkout form
    await page.fill('input[name="fullName"]', 'Test Kullanıcısı');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '5551234567');
    await page.fill('input[name="city"]', 'İstanbul');
    await page.fill('textarea[name="address"]', 'Örnek Mah. Test Sok. No:1 D:2');

    // Select standard shipping
    await page.locator('input[name="shippingMethod"][value="standard"]').click();

    // Select Credit Card
    await page.locator('input[name="paymentMethod"][value="card"]').click();

    // Fill card details
    await page.fill('input[name="cardNumber"]', '4111 1111 1111 1111');
    await page.fill('input[name="cardExpiry"]', '12/25');
    await page.fill('input[name="cardCvv"]', '123');

    // Submit order
    const submitBtn = page.getByRole('button', { name: /ÖDEMEYİ TAMAMLA/i });
    await submitBtn.click();

    // Wait for success sweetalert or redirect
    await expect(page.locator('text=Siparişiniz Alındı!')).toBeVisible({ timeout: 10000 });
  });

  test('should validate empty fields', async ({ page }) => {
    // Add product to cart bypass (use cart API or just standard nav)
    // Going directly to checkout without items will redirect to cart
    // So we need to mock cart state or add an item first
    await page.goto('/');
    const firstProduct = page.locator('a[href^="/urundetay/"]').first();
    await firstProduct.waitFor({ state: 'visible' });
    await firstProduct.click();

    const addToCartBtn = page.getByRole('button', { name: /Sepete Ekle/i });
    await addToCartBtn.waitFor({ state: 'visible' });
    await addToCartBtn.click();

    await page.goto('/checkout');

    // Try to submit without filling
    const submitBtn = page.getByRole('button', { name: /ÖDEMEYİ TAMAMLA/i });
    await submitBtn.click();

    // Check for validation errors
    await expect(page.locator('text=Ad Soyad en az 3 karakter olmalıdır')).toBeVisible();
    await expect(page.locator('text=Geçerli bir e-posta adresi giriniz')).toBeVisible();
  });
});
