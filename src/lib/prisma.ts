/**
 * Prisma Client singleton pour Next.js
 *
 * Prisma 7 requiert un driver adapter explicite.
 * Prod: PostgreSQL via @prisma/adapter-pg (Supabase)
 * Dev local: changer DATABASE_URL vers "file:./dev.db"
 *            et utiliser PrismaBetterSqlite3 à la place
 */
import { PrismaClient } from "@/generated/prisma/client/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in environment variables.");
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

// Évite de créer plusieurs instances en développement (hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
