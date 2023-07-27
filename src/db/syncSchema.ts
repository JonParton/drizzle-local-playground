import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import { migrationConnection } from "./migrationDb";
import { createDbIfMissing } from "./createIfMissing";

export const syncDbSchema = async () => {
  console.log("Starting migration");
  try {
    await createDbIfMissing();

    await migrate(drizzle(migrationConnection), {
      migrationsFolder: "drizzle",
    });
    await migrationConnection.end();
  } catch (e) {
    console.log(e);
    return process.exit(1);
  }
  console.log("Migrations Done");
};
