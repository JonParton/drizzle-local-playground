ALTER TABLE "user"
ALTER COLUMN "userType"
SET DEFAULT 'user';--> statement-breakpoint


UPDATE "user" U
SET "userType" = 'user'
where U."userType" IS NULL;


ALTER TABLE "user"
ALTER COLUMN "userType"
SET NOT NULL;