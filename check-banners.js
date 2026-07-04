
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const banners = await prisma.banner.findMany({
    orderBy: { order: 'asc' },
  });
  
  console.log('Bannerlar:');
  console.log(JSON.stringify(banners, null, 2));
  
  if (banners.length > 0) {
    const efeBanner = banners.find(b => b.title.includes('efe'));
    if (efeBanner) {
      console.log('\n"efe" içeren banner bulundu:');
      console.log(JSON.stringify(efeBanner, null, 2));
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

