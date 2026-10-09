import * as schema from "./schema";
import path from "node:path";
import { projectRoot } from "../root";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

export type DB = PgDatabase<PgQueryResultHKT, typeof schema>;

declare global {
  // eslint-disable-next-line no-var
  var __bdDb: Promise<DB> | undefined;
}

async function connect(): Promise<DB> {
  const url = process.env.DATABASE_URL;
  const migrationsFolder = path.join(projectRoot(), "drizzle");
  let db: DB;
  if (url) {
    // Any Postgres: Neon, Supabase, RDS. Pooled, SSL on.
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    const pool = new Pool({ connectionString: url, max: 3, ssl: url.includes("localhost") ? undefined : { rejectUnauthorized: false } });
    const d = drizzle(pool, { schema });
    await migrate(d, { migrationsFolder });
    db = d as unknown as DB;
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    const dir = path.join(projectRoot(), ".data", "pg");
    const { mkdirSync } = await import("node:fs");
    mkdirSync(dir, { recursive: true });
    const client = new PGlite(dir);
    const d = drizzle(client, { schema });
    await migrate(d, { migrationsFolder });
    db = d as unknown as DB;
  }
  const { ensureSeed } = await import("./seed");
  await ensureSeed(db);
  return db;
}

export function getDb(): Promise<DB> {
  if (!globalThis.__bdDb) {
    globalThis.__bdDb = connect().catch((err) => {
      globalThis.__bdDb = undefined;
      throw err;
    });
  }
  return globalThis.__bdDb;
}

export { schema };
