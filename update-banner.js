const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Banner'ı güncelle
  const updatedBanner = await prisma.banner.update({
    where: { id: 1 },
    data: {
      title: "Size çok yakışacak! ✨",
      // Uygun bir görsel seçelim - public/assets/siteimg/hero_hijab_suit.png
      imageUrl: "/assets/siteimg/hero_hijab_suit.png",
      linkUrl: "/search",
    },
  });

  console.log("Banner güncellendi:");
  console.log(JSON.stringify(updatedBanner, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
