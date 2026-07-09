import prisma from "@/lib/prisma";

class HealthService {
  async checkDatabase() {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
    };
  }
}

export const healthService = new HealthService();
