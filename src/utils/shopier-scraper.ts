import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Bu script (OpenCode ajanı simülasyonu) Shopier'den çekilecek renk varyasyonlarını
// veritabanına eklemek için örnek (mock) bir yapı sunar.
// Gerçek senaryoda burası cheerio/puppeteer kullanılarak shopier.com DOM parse edilerek doldurulur.

const mockShopierData = [
  {
    ad: "Volan detaylı etekli takım",
    fiyat: 2500,
    stok: 10,
    colors: [
      {
        renkAdi: "Siyah",
        gorselUrl:
          "https://d3tfntuwm2qzo4.cloudfront.net/images/products/2025/01/21/48421948/1d279cf7-4f6c-482d-8857-e9a9a5a5a5a5_1.jpg",
      },
      {
        renkAdi: "Kırmızı",
        gorselUrl:
          "https://d3tfntuwm2qzo4.cloudfront.net/images/products/2025/01/21/48421948/1d279cf7-4f6c-482d-8857-e9a9a5a5a5a5_1.jpg", // Using same placeholder image but represents Red
      },
      {
        renkAdi: "Zümrüt Yeşili",
        gorselUrl:
          "https://d3tfntuwm2qzo4.cloudfront.net/images/products/2025/01/21/48421948/1d279cf7-4f6c-482d-8857-e9a9a5a5a5a5_1.jpg", // Using same placeholder image but represents Green
      },
    ],
  },
  {
    ad: "BÜYÜK BEDEN JAKARLI TUNİK",
    fiyat: 1400,
    stok: 15,
    colors: [
      {
        renkAdi: "Standart (Görseldeki)",
        gorselUrl:
          "https://d3tfntuwm2qzo4.cloudfront.net/images/products/2025/01/16/48071808/3f7e61e6-b07f-44a6-98af-f63b6eb4e7a8_1.jpg",
      },
    ],
  },
];

export async function syncShopierProducts() {
  console.log("Shopier verileri senkronize ediliyor...");

  for (const item of mockShopierData) {
    // Ürünü bul veya oluştur
    const product = await prisma.product.create({
      data: {
        ad: item.ad,
        fiyat: item.fiyat,
        stok: item.stok,
        resim: item.colors[0]?.gorselUrl || "", // Varsayılan resim
        colors: {
          create: item.colors.map((c) => ({
            renkAdi: c.renkAdi,
            gorselUrl: c.gorselUrl,
          })),
        },
      },
    });

    console.log(`Ürün eklendi/güncellendi: ${product.ad} (${item.colors.length} renk)`);
  }

  console.log("Senkronizasyon tamamlandı.");
}

// Bu dosya doğrudan ts-node ile çalıştırılırsa:
if (require.main === module) {
  syncShopierProducts()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error(e);
      prisma.$disconnect();
      process.exit(1);
    });
}
