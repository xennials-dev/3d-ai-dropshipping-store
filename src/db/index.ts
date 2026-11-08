import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import path from "path";
import fs from "fs";
import * as schema from "./schema";
import { ensureInitialized } from "./init";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaPglite?: PGlite;
  __arenaDb?: NodePgDatabase;
  __arenaDbInitPromise?: Promise<void>;
};

let db: NodePgDatabase;
let pool: Pool | undefined;
let initPromise: Promise<void> | null = globalForDb.__arenaDbInitPromise ?? null;

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

if (databaseUrl && !databaseUrl.startsWith("pglite") && !databaseUrl.startsWith("local")) {
  const requiresSsl =
    databaseUrl.includes("supabase.co") ||
    databaseUrl.includes("neon.tech") ||
    databaseUrl.includes("sslmode=require") ||
    databaseUrl.includes("pooler.supabase.com");

  pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
      ssl: requiresSsl ? { rejectUnauthorized: false } : undefined,
    });
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }
  db = drizzlePg(pool);
  initPromise = Promise.resolve();
} else {
  let pglite = globalForDb.__arenaPglite;
  if (!pglite) {
    if (isServerless) {
      try {
        const tmpDir = path.join("/tmp", "vendora.db");
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }
        const pidFile = path.join(tmpDir, "postmaster.pid");
        if (fs.existsSync(pidFile)) {
          try { fs.unlinkSync(pidFile); } catch {}
        }
        pglite = new PGlite(tmpDir);
      } catch (err) {
        console.warn("[db] Failed to open /tmp PGlite, using memory instance:", err);
        pglite = new PGlite();
      }
    } else {
      const dataDir = path.join(process.cwd(), ".data", "vendora.db");
      const dirName = path.dirname(dataDir);
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
      }

      try {
        // Remove stale lock files if left behind by interrupted process
        const pidFile = path.join(dataDir, "postmaster.pid");
        if (fs.existsSync(pidFile)) {
          try { fs.unlinkSync(pidFile); } catch {}
        }
        pglite = new PGlite(dataDir);
      } catch (err) {
        console.warn("[db] Failed to open storage at", dataDir, "healing with clean instance…", err);
        try { fs.rmSync(dataDir, { recursive: true, force: true }); } catch {}
        pglite = new PGlite(dataDir);
      }
      if (process.env.NODE_ENV !== "production") {
        globalForDb.__arenaPglite = pglite;
      }
    }
  }

  const liteDb = drizzlePglite(pglite);
  db = liteDb as unknown as NodePgDatabase;
  initPromise = ensureInitialized(pglite, liteDb);
  globalForDb.__arenaDbInitPromise = initPromise;
}

export async function ensureDbReady(): Promise<void> {
  if (initPromise) {
    await initPromise;
  }
}

export { pool, db };
