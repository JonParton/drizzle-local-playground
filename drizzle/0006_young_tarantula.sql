ALTER TABLE "user"
ALTER COLUMN "age"
SET DATA TYPE numeric(2);--> statement-breakpoint

ALTER TABLE "user" ADD CONSTRAINT "user_email_unique" UNIQUE("email");