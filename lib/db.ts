import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function getPool(): Pool {
  if (!global.__pgPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    global.__pgPool = new Pool({ connectionString });
  }
  return global.__pgPool;
}

// Lazily initializes the real Pool on first use, rather than at module import time.
// Next.js imports route modules during the build (to collect page data) long before
// any request happens, so touching process.env.DATABASE_URL at the top level would
// fail the build in environments where it's only configured for runtime.
export const pool: Pool = new Proxy({} as Pool, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getPool(), prop, receiver);
    return typeof value === "function" ? value.bind(getPool()) : value;
  },
});
