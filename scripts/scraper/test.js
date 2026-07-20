const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();
  await p.goto("https://www.shopier.com/CEMREPARKK/48421948", { waitUntil: "networkidle" });

  // Get all texts and tags to find out selectors
  const info = await p.evaluate(() => {
    const titleNode = Array.from(document.querySelectorAll("h1, h2, div")).find(
      (el) => el.innerText && el.innerText.includes("Volan detaylı")
    );
    const priceNode = Array.from(document.querySelectorAll("div, span")).find(
      (el) => el.innerText && el.innerText.includes("2.500")
    );
    const imgNodes = document.querySelectorAll("img");
    const options = document.querySelectorAll("select, option");

    return {
      titleClass: titleNode ? titleNode.className : null,
      titleTag: titleNode ? titleNode.tagName : null,
      priceClass: priceNode ? priceNode.className : null,
      priceText: priceNode ? priceNode.innerText : null,
      images: Array.from(imgNodes).map((i) => i.src),
      hasSelects: options.length > 0,
      selectClasses: Array.from(document.querySelectorAll("select")).map((s) => s.className),
    };
  });
  console.log(info);
  await b.close();
})();
