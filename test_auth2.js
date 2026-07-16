const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function testAuthorize() {
  const credentials = { email: "efe@efe.c", password: "123456" };
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });
  console.log("User found:", !!user);
  if (user) {
    const passwordMatch = await bcrypt.compare(credentials.password, user.password);
    console.log("Password match:", passwordMatch);
  }
}

testAuthorize().finally(() => prisma.$disconnect());
