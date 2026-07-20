const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function downloadImage(url, filepath) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    fs.writeFileSync(filepath, buffer);
    return true;
  } catch (error) {
    console.error(`Failed to download ${url}: ${error.message}`);
    return false;
  }
}

async function main() {
  const imagesDir = path.join(__dirname, "..", "public", "images", "products");
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  const products = await prisma.product.findMany();
  console.log(`${products.length} ürün inceleniyor...`);

  let updatedCount = 0;

  for (const p of products) {
    let updateNeeded = false;
    let newResim = p.resim;
    let newGorsel = p.gorsel;

    // Ana Görsel İndirme
    if (p.resim && p.resim.startsWith("http")) {
      const ext = path.extname(new URL(p.resim).pathname) || ".jpg";
      const filename = `product_${p.id}_main${ext}`;
      const filepath = path.join(imagesDir, filename);

      console.log(`İndiriliyor: ${p.resim}`);
      const success = await downloadImage(p.resim, filepath);
      if (success) {
        newResim = `/images/products/${filename}`;
        updateNeeded = true;
      }
    }

    // Galeri Görselleri İndirme
    if (p.gorsel && p.gorsel.includes("http")) {
      const urls = p.gorsel
        .split(",")
        .map((u) => u.trim())
        .filter((u) => u.startsWith("http"));
      const newUrls = [];
      let galleryIndex = 1;

      for (const url of urls) {
        const ext = path.extname(new URL(url).pathname) || ".jpg";
        const filename = `product_${p.id}_gallery_${galleryIndex}${ext}`;
        const filepath = path.join(imagesDir, filename);

        console.log(`Galeri İndiriliyor: ${url}`);
        const success = await downloadImage(url, filepath);
        if (success) {
          newUrls.push(`/images/products/${filename}`);
        } else {
          newUrls.push(url); // keep original if failed
        }
        galleryIndex++;
      }

      if (newUrls.length > 0) {
        newGorsel = newUrls.join(",");
        updateNeeded = true;
      }
    }

    if (updateNeeded) {
      await prisma.product.update({
        where: { id: p.id },
        data: {
          resim: newResim,
          gorsel: newGorsel,
        },
      });
      console.log(`[+] Veritabanı güncellendi: ${p.ad}`);
      updatedCount++;
    } else {
      console.log(`[ ] Değişiklik yok: ${p.ad}`);
    }
  }

  console.log(`\nİşlem tamamlandı. ${updatedCount} ürünün görselleri yerele aktarıldı.`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
