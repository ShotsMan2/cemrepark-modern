const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function update() {
  await prisma.productColor.updateMany({
    data: { gorselUrl: "/assets/img/product-item-1.jpg" },
  });
  await prisma.product.updateMany({
    where: { ad: { contains: "Volan" } },
    data: { resim: "/assets/img/product-item-1.jpg" },
  });
  await prisma.product.updateMany({
    where: { ad: { contains: "TUNİK" } },
    data: { resim: "/assets/img/product-item-2.jpg" },
  });
  console.log("Images updated to valid local placeholders.");
}

update().finally(() => prisma.$disconnect());
