const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Eski bannerlar temizleniyor...');
  await prisma.banner.deleteMany({});

  console.log('Shopier ürünlerinden yeni bannerlar seçiliyor (Pi Ajanı Mantığı)...');
  const products = await prisma.product.findMany({
    take: 3,
    orderBy: { id: 'desc' }
  });

  if (products.length === 0) {
    console.log('Hiç ürün bulunamadı, banner eklenmedi.');
    return;
  }

  // Pi Ajanı: Slogan üretimi
  const slogans = [
    "YENİ SEZONDA ŞIKLIK SİZİNLE",
    "EN ÇOK TERCİH EDİLEN KOMBİNLER",
    "GÜNLÜK VE ÖZEL GÜNLER İÇİN İDEAL"
  ];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const slogan = slogans[i] || p.ad;
    
    await prisma.banner.create({
      data: {
        title: p.ad.toUpperCase(),
        imageUrl: p.resim || p.gorsel?.split(',')[0] || '/images/hero-1.jpg',
        linkUrl: `/urundetay/${p.id}`,
        isActive: true,
        order: i + 1
      }
    });
    console.log(`[+] Banner eklendi: ${p.ad}`);
  }

  console.log('Banner güncellemesi tamamlandı!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
