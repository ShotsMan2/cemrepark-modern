const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const SHOPIER_URL = "https://www.shopier.com/CEMREPARKK";

async function scrapeShopier() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`Navigating to ${SHOPIER_URL}...`);
  await page.goto(SHOPIER_URL, { waitUntil: "networkidle" });

  // Get product links from the main page
  const productLinks = await page.$$eval("a.shopier-store--store-product-card-link", (links) =>
    links
      .map((a) => a.href)
      .filter((href) => href.includes("/CEMREPARKK/"))
      .filter((v, i, a) => a.indexOf(v) === i)
  );

  console.log(`Found ${productLinks.length} products. Starting data extraction...`);

  const productsData = [];

  for (let i = 0; i < productLinks.length; i++) {
    const link = productLinks[i];
    console.log(`[${i + 1}/${productLinks.length}] Scraping: ${link}`);

    try {
      await page.goto(link, { waitUntil: "domcontentloaded" });

      // Extract inner text of the main container
      const text = await page
        .$eval(".pt-2.product-page.container-product", (el) => el.innerText)
        .catch(() => "");
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l);

      const ad = lines[0] || "Bilinmeyen Ürün";
      const fiyatRaw = lines[1] || "0";

      let fiyatFloat = parseFloat(fiyatRaw.replace(/\./g, "").replace(",", "."));
      if (isNaN(fiyatFloat)) fiyatFloat = 0;

      // Extract Images
      const images = await page.$$eval("img", (imgs) =>
        imgs.map((i) => i.src).filter((src) => src.includes("pictures_large"))
      );
      const resim = images.length > 0 ? images[0] : null;
      const gorsel = images.length > 1 ? images.slice(1).join(",") : null;

      // Try to extract colors and sizes from text if select dropdowns aren't present
      let renkRaw = "";
      let bedenRaw = "";

      const renkLine = lines.find((l) => l.toLowerCase().includes("renk"));
      if (renkLine) {
        renkRaw = renkLine.split(":")[1]?.trim() || "";
      }

      const bedenLine = lines.find((l) => l.toLowerCase().includes("beden"));
      if (bedenLine) {
        bedenRaw = bedenLine;
      }

      const product = {
        kaynak_url: link,
        ad,
        fiyat: fiyatFloat,
        resim,
        gorsel,
        renk_raw: renkRaw,
        beden_raw: bedenRaw,
        stok: 10,
      };

      productsData.push(product);
      console.log(`  -> Başarılı: ${ad} - ${fiyatFloat} TL`);
    } catch (e) {
      console.error(`  -> Hata (${link}):`, e.message);
    }
  }

  // Save to JSON file
  const outDir = path.join(__dirname);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, "products_raw.json");
  fs.writeFileSync(outFile, JSON.stringify(productsData, null, 2));
  console.log(`\nScraping complete. Data saved to ${outFile}`);

  await browser.close();
}

scrapeShopier().catch(console.error);
