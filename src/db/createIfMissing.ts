import { sql } from "drizzle-orm";
import { dbMaster } from "./masterDb";
import { env } from "src/env";

export const createDbIfMissing = async () => {
  const databaseName = env.DATABASE_NAME!;

  const existingDB = await dbMaster.execute<{}>(
    sql`SELECT FROM pg_database WHERE datname = ${databaseName}`
  );

  if (existingDB.length == 0) {
    console.log(`The database "${databaseName} doesnt exist yet! Creating now`);

    await dbMaster.execute(sql.raw(`CREATE DATABASE ${databaseName}`));
  }
};
