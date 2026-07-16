const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, password: true } });
  console.log(users);
}

listUsers().finally(() => prisma.$disconnect());
