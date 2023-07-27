import { sql } from "drizzle-orm";

import { dbMaster } from "./masterDb";

const main = async () => {
  const databaseName = process.env.DATABASE_NAME!;
  try {
    const existingDB = await dbMaster.execute<{}>(
      sql`SELECT FROM pg_database WHERE datname = ${databaseName}`
    );

    if (existingDB.length !== 0) {
      console.log(`Dropping database "${databaseName}"! ⚠️`);

      await dbMaster.execute(sql.raw(`DROP DATABASE ${databaseName}`));
    }
  } catch (e) {
    console.log(e);
    return process.exit(1);
  }

  process.exit(0);
};

main();
