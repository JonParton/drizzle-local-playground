import { eq, sql } from "drizzle-orm";

import { post, user } from "./schema";
import { db } from "./db/mainDb";
import { syncDbSchema } from "./db/syncSchema";

const main = async () => {
  await syncDbSchema();

  // const users = await db.select({}).from(user);
  // .leftJoin(transaction, eq(user.id, transaction.sender));

  // console.log(JSON.stringify(users, null, 2));

  const usersWithPostsAndComments = await db.query.user.findMany({
    with: {
      posts: {
        with: {
          comments: true,
        },
      },
    },
    extras: (table) => ({
      totalPostStars: sql
        .raw(`sum("user_posts"."starRating")`) // Would love not to hard code this ...
        .as("totalPostStars"),
    }),
  });

  console.log(JSON.stringify(usersWithPostsAndComments, null, 2));

  process.exit(0);
};

main();
