import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("Should navigate to admin login page and fail with invalid credentials", async ({ page }) => {
    // Navigate to admin login page
    await page.goto("/admin");

    // Wait for the login form to load
    await page.waitForSelector('form');

    // Fill in email and password
    await page.fill('input[type="text"], input[type="email"], input[name="email"]', "invalid@example.com");
    await page.fill('input[type="password"]', "wrongpassword123");

    // Click submit
    await page.click('button[type="submit"]');

    // Should not navigate to dashboard or should show error
    // In many NextAuth setups, a failed login stays on the same page with an error parameter or toast.
    await expect(page.url()).not.toContain("/admin/dashboard");
  });
});
