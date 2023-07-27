import { comment, post, user } from "src/schema";
import { db } from "./mainDb";
import {
  randUser,
  rand,
  randNumber,
  seed,
  randUuid,
  randText,
  randParagraph,
  randSentence,
} from "@ngneat/falso";
import { syncDbSchema } from "./syncSchema";
import { InferModel, eq } from "drizzle-orm";

const main = async () => {
  await syncDbSchema();

  console.log("Starting db Seed 🌱🚿");

  seed("hello! I want consistent random values!");

  const users: InferModel<typeof user, "insert">[] = [];

  for (let i = 0; i < 10; i++) {
    const randomUser = randUser();
    const userData: InferModel<typeof user, "insert"> = {
      name: `${randomUser.firstName} ${randomUser.lastName}`,
      userType: rand(["admin", "user"]),
      email: randomUser.email,
      age: randNumber({ min: 9, max: 110 }),
    };
    const userId = await db
      .insert(user)
      .values(userData)
      .returning({
        id: user.id,
      })
      .onConflictDoUpdate({
        target: [user.email],
        set: {
          ...userData,
        },
      });

    for (let i = 0; i < randNumber({ min: 0, max: 8 }); i++) {
      const postData: InferModel<typeof post, "insert"> = {
        id: randUuid(),
        authorId: userId[0].id,
        body: randParagraph(),
        title: randSentence(),
        starRating: randNumber({ min: 0, max: 5 }),
      };

      await db.insert(post).values(postData).onConflictDoNothing();

      await db.insert(comment).values({
        postId: postData.id,
        authorId: userId[0].id,
        text: "Arn't I great!",
        id: randUuid(),
      });
    }
  }
};

main()
  .then(() => {
    console.log("Seeding Complete! 🌱✅");
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
