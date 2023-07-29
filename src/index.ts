import { eq, getTableColumns, sql } from "drizzle-orm";

import { comment, post, user } from "./schema";
import { db } from "./db/mainDb";
import { syncDbSchema } from "./db/syncSchema";
import { jsonAgg } from "./db/utils";

const main = async () => {
  await syncDbSchema();

  // const users = await db.select({}).from(user);
  // .leftJoin(transaction, eq(user.id, transaction.sender));

  // console.log(JSON.stringify(users, null, 2));

  // const usersWithPostsAndComments = await db.query.user.findMany({
  //   with: {
  //     posts: {
  //       with: {
  //         comments: true,
  //       },
  //     },
  //   },
  //   extras: (table) => ({
  //     totalPostStars: sql
  //       .raw(`sum("user_posts"."starRating")`) // Would love not to hard code this ...
  //       .as("totalPostStars"),
  //   }),
  // });

  // console.log(JSON.stringify(usersWithPostsAndComments, null, 2));

  const postsWithComments = db.$with("postsWithComments").as(
    db
      .select({
        ...getTableColumns(post),
        userStarRating: sql<number>`sum(${comment.userStarRating})`.as(
          "userStarRating"
        ),
        countOfUserStarRatings:
          sql<number>`count(${comment.userStarRating})`.as(
            "countOfUserStarRatings"
          ),
        averageUserStarRating:
          sql<number>`sum(${comment.userStarRating})/count(${comment.userStarRating})`.as(
            "averageUserStarRating"
          ),
        comments: jsonAgg(comment).as("comments"),
      })
      .from(post)
      .leftJoin(comment, eq(post.id, comment.postId))
      .groupBy(post.id)
  );

  const usersWithPostsAndComments = db

    .with(postsWithComments)
    .select({
      ...getTableColumns(user),
      totalPostRatings: sql<number>`sum(${postsWithComments.starRating})`.as(
        "totalPostRatings"
      ),
      averageUserPostRatings:
        sql<number>`sum(${postsWithComments.starRating})/count(${postsWithComments.starRating})`.as(
          "averageUserPostRatings"
        ),
      totalCommentRatings:
        sql<number>`sum(${postsWithComments.userStarRating})`.as(
          "totalCommentRatings"
        ),
      averageUserCommentRatings:
        sql<number>`sum(${postsWithComments.userStarRating})/sum(${postsWithComments.countOfUserStarRatings})`.as(
          "averageUserCommentRatings"
        ),
      posts: jsonAgg(postsWithComments as any).as("posts"),
    })
    .from(user)
    .leftJoin(postsWithComments, eq(user.id, postsWithComments.authorId))
    .groupBy(user.id)
    .limit(2);

  console.log(usersWithPostsAndComments.toSQL());
  console.log();

  console.log(JSON.stringify(await usersWithPostsAndComments, null, 2));

  const userWithSummaryStats = await db
    .select({
      ...getTableColumns(user),
      averageUserPostRatings: sql<number>`avg(${comment.userStarRating})`.as(
        "averageUserPostRatings"
      ),
    })
    .from(user)
    .leftJoin(post, eq(user.id, post.authorId))
    .leftJoin(comment, eq(post.id, comment.postId))
    .groupBy(user.id);

  console.log(JSON.stringify(userWithSummaryStats, null, 2));

  process.exit(0);
};

main();
