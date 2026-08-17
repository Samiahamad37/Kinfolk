import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";
import path from "node:path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveSqliteUrl() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  if (!url.startsWith("file:")) return url;

  const relative = url.replace(/^file:/, "");
  const absolute = path.isAbsolute(relative)
    ? relative
    : path.resolve(process.cwd(), relative);

  return `file:${absolute}`;
}

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: resolveSqliteUrl() });
  return new PrismaClient({ adapter });
}

function getPrisma() {
  const existing = globalForPrisma.prisma;
  // Recreate if HMR left a client from an older schema
  if (existing && typeof (existing as { familyEvent?: unknown }).familyEvent === "undefined") {
    globalForPrisma.prisma = undefined;
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = getPrisma();

