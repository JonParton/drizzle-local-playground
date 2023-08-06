import type { Config } from "drizzle-kit";
import { env } from "./src/env";
export default {
  schema: "src/schema.ts",
  out: "drizzle",
  driver: "pg", // Note ... we are using postgres in the main app not pg...
  dbCredentials: {
    connectionString: env.DATABASE_URL,
    // database: "pgtest"
  },
} satisfies Config;
