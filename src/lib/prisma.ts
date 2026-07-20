import { PrismaClient, Prisma } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const logOptions: Prisma.LogLevel[] =
  process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"];

export const prisma = (
  globalForPrisma.prisma ??
  new PrismaClient({
    log: logOptions,
  })
).$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        const start = Date.now();
        const result = await query(args);
        const end = Date.now();
        const time = end - start;
        if (time > 100) {
          console.warn(`[PRISMA SLOW QUERY] ${model}.${operation} took ${time}ms`);
        }
        return result;
      },
    },
  },
}) as unknown as PrismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
