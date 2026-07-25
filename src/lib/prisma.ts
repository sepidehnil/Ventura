import { PrismaClient } from "@prisma/client";
import { copyFileSync, existsSync } from "fs";
import { tmpdir } from "os";
import path from "path";

function resolveDatabaseUrl(): string {
  const configured = process.env.DATABASE_URL;

  // Hosted DBs (Postgres, etc.) — use as-is
  if (configured && !configured.startsWith("file:")) {
    return configured;
  }

  const seedDb = path.join(process.cwd(), "prisma", "seed.db");

  // Vercel filesystem is read-only except /tmp — copy seeded SQLite there.
  // Include deployment id so a new deploy never reuses a stale /tmp DB
  // (e.g. old .png image paths from a previous release).
  if (process.env.VERCEL) {
    const deployId =
      process.env.VERCEL_DEPLOYMENT_ID ||
      process.env.VERCEL_GIT_COMMIT_SHA ||
      "local";
    const tmpDb = path.join(tmpdir(), `ventura-${deployId}.db`);
    if (!existsSync(tmpDb)) {
      if (!existsSync(seedDb)) {
        throw new Error(
          "Missing prisma/seed.db. Run: npm run prisma:prepare-seed"
        );
      }
      copyFileSync(seedDb, tmpDb);
    }
    return `file:${tmpDb}`;
  }

  return configured || "file:./dev.db";
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolveDatabaseUrl(),
      },
    },
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
