import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
});

export const transaction = pgTable("transaction", {
  id: uuid("id").defaultRandom().primaryKey(),
  sender: uuid("sender_user_id").references(() => user.id),
  recipient: uuid("recipient_user_id").references(() => user.id),
});
