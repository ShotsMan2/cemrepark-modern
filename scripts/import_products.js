const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const jsonPath = path.join(__dirname, 'scraper', 'products_raw.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('products_raw.json bulunamadı. Lütfen önce scraper betiğini çalıştırın.');
    process.exit(1);
  }

  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const products = JSON.parse(rawData);

  console.log(`${products.length} ürün içe aktarılıyor...`);

  let addedCount = 0;
  let errorCount = 0;

  for (const p of products) {
    try {
      // Data Normalization (Pi'nin yapacağı işin kodlanmış hali)
      // Örn: "Renk seçenekleri: Kahve • Sarı" şeklindeki metinleri temizleme
      let renk = p.renk_raw || '';
      if (renk.includes('Renk seçenekleri:')) {
         renk = renk.replace('Renk seçenekleri:', '').trim();
         renk = renk.split('•').map(r => r.trim()).join(', ');
      }

      let beden = p.beden_raw || '';

      // Aynı isimde ürün var mı kontrolü
      const existingProduct = await prisma.product.findFirst({
        where: { ad: p.ad }
      });

      if (!existingProduct) {
        await prisma.product.create({
          data: {
            ad: p.ad,
            fiyat: p.fiyat,
            kategori: p.kategori || 'Shopier',
            resim: p.resim,
            gorsel: p.gorsel,
            renk: renk,
            beden: beden,
            stok: p.stok || 10
          }
        });
        console.log(`[+] Eklendi: ${p.ad}`);
        addedCount++;
      } else {
        console.log(`[!] Zaten var, atlanıyor: ${p.ad}`);
      }
    } catch (error) {
      console.error(`[-] Hata (${p.ad}): ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\nİçe aktarma tamamlandı. Başarılı: ${addedCount}, Hata: ${errorCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
