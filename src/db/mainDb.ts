import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../schema";
import { env } from "src/env";

const queryConnection = postgres(env.DATABASE_URL);

export const db = drizzle(queryConnection, {
  logger: true,
  schema: { ...schema },
});
