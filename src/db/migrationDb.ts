import postgres from "postgres";
import { env } from "src/env";

export const migrationConnection = postgres(env.DATABASE_URL, {
  max: 1,
});
