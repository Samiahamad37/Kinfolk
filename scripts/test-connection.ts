import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { normalizeDatabaseUrl } from "../src/lib/db-url";

async function main() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const connectionString = normalizeDatabaseUrl(rawUrl);
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const result = await prisma.$queryRawUnsafe<{ connected: number }[]>(
    "SELECT 1 as connected",
  );
  console.log("Connected to Postgres:", result);

  const users = await prisma.user.count();
  const people = await prisma.person.count();
  console.log(`Users: ${users}, People: ${people}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
