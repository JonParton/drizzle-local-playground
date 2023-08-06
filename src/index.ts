import { InferModel, Table, eq, getTableColumns, sql } from "drizzle-orm";

import { comment, post, user } from "./schema";
import { db } from "./db/mainDb";
import { syncDbSchema } from "./db/syncSchema";
import { jsonAgg, jsonAggSubQuery } from "./db/utils";

const main = async () => {
  await syncDbSchema();

  // const users = await db.select({}).from(user);
  // .leftJoin(transaction, eq(user.id, transaction.sender));

  // console.log(JSON.stringify(users, null, 2));

  const usersWithPostsAndCommentsRelational = await db.query.user.findMany({
    with: {
      posts: {
        with: {
          comments: true,
        },
      },
    },
    extras: (table) => ({
      // totalPostStars: sql
      //   .raw(`sum("user_posts"."starRating")`) // Would love not to hard code this ...
      //   .as("totalPostStars"), // You can no longer do this due to the
      //   lateral join change included as part of the 0.28.0 drizzle release!
    }),
    limit: 2,
  });

  console.log(JSON.stringify(usersWithPostsAndCommentsRelational, null, 2));

  //Instead of relying on the relational helpers Drizzle provide, maybe using
  //the `jsonAgg` helper from
  //https://gist.github.com/rphlmr/0d1722a794ed5a16da0fdf6652902b15 will help... 🤔
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

  const usersWithPostsAndComments = await db

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
      posts: jsonAggSubQuery(postsWithComments).as("posts"), // This breaks our typescript here, however the jsonAgg function won't take a sub query only a table... Even though it does actually work runtime wise.
    })
    .from(user)
    .leftJoin(postsWithComments, eq(user.id, postsWithComments.authorId))
    .groupBy(user.id)
    .limit(2);

  // --------
  // CURRENT DRIZZLE Q... Trying to get typing correct for say accessing the
  // property below
  //usersWithPostsAndComments[0].posts[0].averageUserStarRating

  // OR even accessing the jsonagg'd comments in the sub query itself!
  //usersWithPostsAndComments[0].posts[0].comments[0].

  // --------

  console.log(JSON.stringify(usersWithPostsAndComments, null, 2));

  // As simpler example just using pure SQL to get the summary stats without the
  // jsonAgg actual data returns.
  // const userWithSummaryStats = await db
  //   .select({
  //     ...getTableColumns(user),
  //     averageUserPostRatings: sql<number>`avg(${comment.userStarRating})`.as(
  //       "averageUserPostRatings"
  //     ),
  //   })
  //   .from(user)
  //   .leftJoin(post, eq(user.id, post.authorId))
  //   .leftJoin(comment, eq(post.id, comment.postId))
  //   .groupBy(user.id);

  // console.log(JSON.stringify(userWithSummaryStats, null, 2));

  process.exit(0);
};

main();
