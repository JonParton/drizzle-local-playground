import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { eq } from "drizzle-orm/pg-core/expressions";

import { transaction, user } from "./schema";

const migrationConnection = postgres(process.env.DATABASE_URL!, { max: 1 });
const queryConnection = postgres(process.env.DATABASE_URL!);

const db = drizzle(queryConnection, { logger: true });

const main = async () => {
  console.log("Starting migration");
  try {
    await migrate(drizzle(migrationConnection), {
      migrationsFolder: "drizzle",
    });
    await migrationConnection.end();
  } catch (e) {
    console.log(e);
    return process.exit(1);
  }
  console.log("Migrations Done");

  //   await db.insert(user).values([{ name: "alef" }, { name: "bolk" }]);
  console.log(
    await db
      .select()
      .from(user)
      .leftJoin(transaction, eq(user.id, transaction.sender))
  );
  process.exit(0);
};

main();
