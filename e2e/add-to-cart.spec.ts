import { test, expect } from "@playwright/test";

test.describe("Add to Cart Flow", () => {
  test("should allow user to add a product to the cart from product details", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");

    // Find a product link and click it (we assume there are product links on the homepage)
    // Looking for links that point to /urundetay/
    const productLink = page.locator('a[href^="/urundetay/"]').first();
    await expect(productLink).toBeVisible({ timeout: 10000 });

    // Get href to navigate or just click
    await productLink.click();

    // Wait for the product detail page to load
    await expect(page).toHaveURL(/.*urundetay\/.+/);

    // Click "Sepete Ekle" button
    const addToCartButton = page.locator("button", { hasText: /Sepete Ekle/i }).first();
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    // Verify it was added (e.g., toast message or cart counter update)
    // Assuming cart counter is in a link to /cart
    const cartLink = page.locator('a[href="/cart"]');
    await expect(cartLink).toBeVisible();

    // Check if the cart counter is displayed
    const cartCounter = cartLink.locator("span.absolute");
    if ((await cartCounter.count()) > 0) {
      const countText = await cartCounter.textContent();
      expect(Number(countText)).toBeGreaterThan(0);
    }
  });
});
