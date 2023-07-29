import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  uuid,
  numeric,
  varchar,
  doublePrecision,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 500 }).unique(),
  userType: varchar("userType", { enum: ["user", "admin"] })
    .default("user")
    .notNull(),
  age: doublePrecision("age"),
});

export const usersRelations = relations(user, ({ many }) => ({
  posts: many(post),
}));

export const post = pgTable("post", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title"),
  starRating: doublePrecision("starRating"),
  body: text("body"),
  authorId: uuid("author_id").references(() => user.id),
});

export const postsRelations = relations(post, ({ one, many }) => ({
  author: one(user, {
    fields: [post.authorId],
    references: [user.id],
  }),
  comments: many(comment),
}));

export const comment = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  text: text("text"),
  authorId: uuid("author_id").references(() => user.id),
  userStarRating: doublePrecision("starRating"),
  postId: uuid("post_id").references(() => post.id),
});

export const commentsRelations = relations(comment, ({ one }) => ({
  post: one(post, {
    fields: [comment.postId],
    references: [post.id],
  }),
}));
