import { Kysely, PostgresDialect, sql } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { Kyselify } from "drizzle-orm/kysely";
import { comment, post, user } from "./schema";
import { Pool } from "pg";
import { env } from "./env";

interface Database {
  user: Kyselify<typeof user>;
  post: Kyselify<typeof post>;
  comment: Kyselify<typeof comment>;
}

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      database: env.DATABASE_NAME,
      host: env.DATABASE_HOST,
      user: env.DATABASE_USERNAME,
      password: env.DATABASE_PASSWORD,
      port: env.DATABASE_PORT,
      max: 10,
    }),
  }),
});

const main = async () => {
  // fully typed Kysely result and query builder
  const result = await db
    .with("userPosts", (eb) =>
      eb
        .selectFrom("post")
        .leftJoin("comment", (eb) =>
          eb.onRef("post.id", "=", "comment.post_id")
        )
        .selectAll("post")
        .select((eb) => [
          // Create a Nested JSON property with all the comments
          jsonArrayFrom(
            eb
              .selectFrom("comment")
              .selectAll()
              .whereRef("comment.post_id", "=", "post.id")
          ).as("comments"),
          // Sum up all the Comment Start Ratings
          eb.fn.sum(eb.ref("comment.starRating")).as("sumOfCommentStarRatings"),
          // Count how many star ratings from Comments there were for each post.
          eb.fn
            .count(eb.ref("comment.starRating"))
            .as("countOfCommentStarRatings"),
        ])
        .groupBy("post.id")
    )
    .selectFrom("user")
    .selectAll("user")
    .select((eb) => [
      // Make a nested jason field with all the Posts
      jsonArrayFrom(
        eb
          .selectFrom("userPosts")
          .selectAll("userPosts")
          .whereRef("user.id", "=", "userPosts.author_id")
      ).as("posts"),
      // Make an average Star Rating comment users gave the person.
      eb
        .selectFrom("userPosts")
        .select((subEb) => [
          sql<number>`(sum(${subEb.ref(
            "userPosts.sumOfCommentStarRatings"
          )}) / count(${subEb.ref("userPosts.countOfCommentStarRatings")}))`.as(
            "averageUserStarRatingInner"
          ),
        ])
        .groupBy("userPosts.author_id")
        .whereRef("user.id", "=", "userPosts.author_id")
        .as("averageUserStarRating"),
    ])
    // Only bring back 3
    .limit(3)
    // Log out the query!
    .$call((qb) => {
      console.log(qb.compile().sql);
      return qb;
    })
    .execute();

  // Even though we have done all the nesting etc the below still works with
  // Typescript! 🙌
  // result[0].posts[0].comments[0].starRating

  console.log(JSON.stringify(result, null, 2));

  process.exit(0);
};

main();
