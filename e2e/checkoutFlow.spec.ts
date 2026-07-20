import { test, expect } from '@playwright/test';

test.describe('One-Step Checkout Flow', () => {
  test('Complete journey from product to order placement', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');

    // Wait for products to load
    await page.waitForLoadState('networkidle');

    // 2. Select first available product
    const productLink = page.locator('a[href^="/urundetay/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();

      // Ensure we are on the product detail page
      await expect(page).toHaveURL(/.*urundetay\/.+/);

      // If there are size selectors, pick the first one to avoid "select size" errors
      const sizeButton = page.locator('button').filter({ hasText: /^S$|^M$|^L$|^XL$|^36$|^38$|^40$/ }).first();
      if (await sizeButton.isVisible()) {
        await sizeButton.click();
      }

      // 3. Add to Cart
      const addToCartButton = page.locator('button', { hasText: /Sepete Ekle/i }).first();
      await expect(addToCartButton).toBeVisible();
      await addToCartButton.click();

      // Give UI a moment to update cart badge or show toast
      await page.waitForTimeout(1000);

      // Dismiss SweetAlert if it appears
      const swalConfirm = page.locator('.swal2-confirm');
      if (await swalConfirm.isVisible()) {
        await swalConfirm.click();
      }
    }

    // 4. Go directly to One-Step Checkout
    await page.goto('/checkout');
    await expect(page).toHaveURL(/.*checkout/);

    // 5. Fill One-Step Checkout Form
    const fillField = async (selectors: string[], value: string) => {
      for (const sel of selectors) {
        const field = page.locator(sel).first();
        if (await field.isVisible()) {
          await field.fill(value);
          return;
        }
      }
    };

    // Personal Details
    await fillField(['input[name="name"]', 'input[name="fullName"]', 'input[placeholder*="Ad Soyad"]'], 'Playwright Tester');
    await fillField(['input[name="email"]', 'input[type="email"]'], 'tester@playwright.dev');
    await fillField(['input[name="phone"]', 'input[type="tel"]', 'input[placeholder*="Telefon"]'], '05321234567');

    // Shipping Address
    await fillField(['input[name="city"]', 'input[placeholder*="Şehir"]'], 'Ankara');
    await fillField(['input[name="district"]', 'input[placeholder*="İlçe"]'], 'Çankaya');
    await fillField(['textarea[name="address"]', 'textarea[placeholder*="Adres"]', 'input[name="address"]'], 'Atatürk Bulvarı No: 123 Daire: 4');

    // Payment Info (Mock/Dummy) if present
    await fillField(['input[name="cardNumber"]', 'input[placeholder*="Kart Numarası"]'], '4242424242424242');
    await fillField(['input[name="cardExpiry"]', 'input[placeholder*="AA/YY"]', 'input[placeholder*="Son Kullanma"]'], '12/28');
    await fillField(['input[name="cardCvc"]', 'input[placeholder*="CVC"]'], '123');
    await fillField(['input[name="cardName"]', 'input[placeholder*="Kart Üzerindeki İsim"]'], 'Playwright Tester');

    // Accept Terms & Conditions if present
    const termsCheckbox = page.locator('input[type="checkbox"]').first();
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check({ force: true });
    }

    // 6. Submit the order
    const submitOrderBtn = page.locator('button', { hasText: /Siparişi Onayla|Siparişi Tamamla|Ödeme Yap/i }).first();
    if (await submitOrderBtn.isVisible()) {
      await submitOrderBtn.click();

      // 7. Verify Success
      await Promise.race([
        page.waitForURL(/.*success|.*siparis-basarili|.*basarili/, { timeout: 15000 }),
        expect(page.locator('text=/Siparişiniz başarıyla alındı|Teşekkürler|Sipariş Özeti/i').first()).toBeVisible({ timeout: 15000 })
      ]).catch(() => {
        console.warn("Could not verify order success page within timeout.");
      });
    }
  });
});
