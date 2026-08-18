import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";
import { normalizeDatabaseUrl } from "@/lib/db-url";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const connectionString = normalizeDatabaseUrl(rawUrl);

  const pool =
    globalForPrisma.pgPool ??
    new Pool({
      connectionString,
      // Soften serverless cold starts on platforms like Vercel
      max: process.env.NODE_ENV === "production" ? 1 : 10,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pgPool = pool;
  }

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function getPrisma() {
  const existing = globalForPrisma.prisma;
  // Recreate if HMR left a client from an older schema/config
  if (
    existing &&
    (typeof (existing as { familyEvent?: unknown }).familyEvent === "undefined" ||
      !(globalForPrisma.pgPool as { __sslCompat?: boolean } | undefined)?.__sslCompat)
  ) {
    void existing.$disconnect().catch(() => undefined);
    void globalForPrisma.pgPool?.end().catch(() => undefined);
    globalForPrisma.prisma = undefined;
    globalForPrisma.pgPool = undefined;
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
    if (globalForPrisma.pgPool) {
      (globalForPrisma.pgPool as { __sslCompat?: boolean }).__sslCompat = true;
    }
  }
  return globalForPrisma.prisma;
}

export const prisma = getPrisma();
