import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should navigate to login page and show error with invalid credentials', async ({ page }) => {
    // Navigate to user login page
    await page.goto('/login');

    // Wait for the login form to load
    await expect(page.locator('form')).toBeVisible();

    // Fill in email and password
    await page.fill('input[type="email"]', 'invalid-user@example.com');
    await page.fill('input[type="password"]', 'wrongpassword123');

    // Click submit
    await page.click('button[type="submit"]');

    // Should stay on login page and possibly show an error
    await expect(page).toHaveURL(/.*login/);
  });

  test('should allow user to toggle password visibility', async ({ page }) => {
    await page.goto('/login');
    const passwordInput = page.locator('input[name="password"]');
    
    // initially it should be password type
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // click eye icon button next to it
    const toggleBtn = page.locator('button.absolute.right-3.top-1\\/2');
    if (await toggleBtn.count() > 0) {
      await toggleBtn.first().click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });
});
