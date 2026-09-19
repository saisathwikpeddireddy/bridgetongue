import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

/**
 * The database is optional at this stage. The landing page and the transfer
 * engine are pure and must keep working with no DATABASE_URL set, so that a
 * fresh clone runs with `npm run dev` and nothing else.
 */
let cached: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!cached) cached = drizzle(neon(url), { schema });
  return cached;
}

export { schema };
