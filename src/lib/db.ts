import "server-only";
import { Pool } from "pg";

const globalForDb = globalThis as unknown as { propmentorsPool?: Pool };

export function database() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing. Configure PostgreSQL and run npm run db:setup.");
  if (!globalForDb.propmentorsPool) {
    globalForDb.propmentorsPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 5_000,
    });
    globalForDb.propmentorsPool.on("error", (error) => console.error("PostgreSQL pool error:", error.message));
  }
  return globalForDb.propmentorsPool;
}
