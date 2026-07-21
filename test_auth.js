const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

async function testAuth() {
  try {
    const email = "test_auth_script@test.com";
    const password = "password123";

    // 1. Delete if exists
    await prisma.user.deleteMany({ where: { email } });

    // 2. Hash and create
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: "Test User",
      },
    });
    console.log("User created:", user.email, "Hashed pass:", hashedPassword);

    // 3. Retrieve and compare
    const retrievedUser = await prisma.user.findUnique({ where: { email } });
    console.log("Retrieved pass:", retrievedUser.password);

    const match = await bcrypt.compare(password, retrievedUser.password);
    console.log("Password match:", match);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
