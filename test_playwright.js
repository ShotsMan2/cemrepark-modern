const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navigating to login page...");
  await page.goto("http://localhost:3000/login");

  console.log("Filling form...");
  // Using generic locators for type="email" and type="password"
  await page.fill('input[type="email"]', "efe@efe.c");
  await page.fill('input[type="password"]', "123456");

  console.log("Submitting...");
  await page.click('button[type="submit"]');

  // Wait a bit for the error or navigation
  await page.waitForTimeout(3000);

  console.log("Checking debug_auth.txt...");
  try {
    const fs = require("fs");
    const content = fs.readFileSync("debug_auth.txt", "utf8");
    console.log("--- debug_auth.txt ---");
    console.log(content);
    console.log("----------------------");
  } catch (e) {
    console.log("debug_auth.txt not found", e.message);
  }

  await browser.close();
})();
