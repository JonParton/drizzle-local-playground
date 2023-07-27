import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const masterConnection = postgres(process.env.DATABASE_MASTER_URL!, { max: 1 });

export const dbMaster = drizzle(masterConnection, { logger: true });
