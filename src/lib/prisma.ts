import { PrismaClient, Prisma } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const logOptions: Prisma.LogLevel[] =
  process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"];

const createPrismaClient = () => {
  return new PrismaClient({
    log: logOptions,
  });
};

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

export const prisma: ExtendedPrismaClient = (
  globalForPrisma.prisma ?? createPrismaClient()
).$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }: { operation: string; model: string; args: unknown; query: (args: unknown) => Promise<unknown> }) {
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
}) as ExtendedPrismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
