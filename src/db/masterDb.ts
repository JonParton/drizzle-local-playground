import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "src/env";

const masterConnection = postgres(env.DATABASE_MASTER_URL, { max: 1 });

export const dbMaster = drizzle(masterConnection, { logger: true });
