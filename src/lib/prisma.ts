/**
 * Prisma Client singleton pour Next.js
 *
 * Prisma 7 requiert un driver adapter explicite.
 * Dev: SQLite via @prisma/adapter-better-sqlite3
 * Prod: Remplacer par @prisma/adapter-pg (PostgreSQL/Supabase)
 */
import { PrismaClient } from "@/generated/prisma/client/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  });
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
