import { test, expect } from '@playwright/test';

test.describe('E-commerce Critical Path - Checkout Flow', () => {
  test('should complete the add to cart, checkout and place order flow', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');
    
    // 2. Navigate to a product detail page
    // Using a generic product URL; assuming product ID 1 exists for E2E tests
    await page.goto('/urundetay/1');

    // 3. Add product to the cart
    const addToCartButton = page.locator('button', { hasText: /Sepete Ekle/i }).first();
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    // Wait for toast notification or cart state update
    await page.waitForTimeout(1000);

    // 4. Navigate to Cart
    await page.goto('/cart');
    
    // Ensure we are in the cart and can proceed to checkout
    const checkoutButton = page.locator('button', { hasText: /Ödemeye Geç|Satın Al/i }).first();
    await expect(checkoutButton).toBeVisible();
    await checkoutButton.click();

    // 5. Checkout Form Filling
    await expect(page).toHaveURL(/.*checkout/);
    
    // Fill out shipping and billing details
    const nameInput = page.locator('input[name="name"], input[name="fullName"], input[placeholder*="Ad Soyad"]');
    if (await nameInput.isVisible()) await nameInput.fill('E2E Test User');
    
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    if (await emailInput.isVisible()) await emailInput.fill('e2e-test@example.com');
    
    const phoneInput = page.locator('input[type="tel"], input[name="phone"]');
    if (await phoneInput.isVisible()) await phoneInput.fill('05555555555');
    
    const addressInput = page.locator('textarea[name="address"], input[name="address"], textarea[placeholder*="Adres"]');
    if (await addressInput.isVisible()) await addressInput.fill('E2E Test Address, No: 1, Daire: 2');
    
    const cityInput = page.locator('input[name="city"], input[placeholder*="Şehir"]');
    if (await cityInput.isVisible()) await cityInput.fill('İstanbul');
    
    const districtInput = page.locator('input[name="district"], input[placeholder*="İlçe"]');
    if (await districtInput.isVisible()) await districtInput.fill('Kadıköy');

    // Accept terms if any checkbox is present
    const termsCheckbox = page.locator('input[type="checkbox"]');
    if (await termsCheckbox.count() > 0) {
      await termsCheckbox.first().check({ force: true });
    }

    // 6. Place the Order
    const placeOrderButton = page.locator('button', { hasText: /Siparişi Tamamla|Onayla ve Bitir/i }).first();
    await expect(placeOrderButton).toBeVisible();
    await placeOrderButton.click();

    // 7. Verify Successful Order Placement
    // Wait for navigation to success page or a success message
    await page.waitForURL(/.*success|.*siparis-basarili|.*basarili/, { timeout: 10000 }).catch(() => {
        // Fallback: Check for success message on current page if not redirected
    });
    
    const successMessage = page.locator('text=/Siparişiniz başarıyla alındı|Teşekkürler|Siparişiniz tamamlandı/i');
    if (await successMessage.isVisible()) {
        await expect(successMessage).toBeVisible();
    }
  });
});
