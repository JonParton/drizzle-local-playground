import postgres from "postgres";

export const migrationConnection = postgres(process.env.DATABASE_URL!, {
  max: 1,
});
