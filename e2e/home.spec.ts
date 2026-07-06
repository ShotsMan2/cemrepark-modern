import { test, expect } from "@playwright/test";

test("homepage has correct title", async ({ page }) => {
  await page.goto("/");

  // We are just checking if the page loads and has a title
  // Update this with the actual expected title of your application
  await expect(page).toHaveTitle(/./);
});
