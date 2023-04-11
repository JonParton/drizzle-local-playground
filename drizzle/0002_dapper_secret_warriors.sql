CREATE TABLE IF NOT EXISTS "transaction" ( "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
																																											"sender_user_id" uuid,
																																											"recipient_user_id" uuid);


CREATE TABLE IF NOT EXISTS "user" ( "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
																																				"name" text);

DO $$ BEGIN
 ALTER TABLE transaction ADD CONSTRAINT transaction_sender_user_id_user_id_fk FOREIGN KEY ("sender_user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE transaction ADD CONSTRAINT transaction_recipient_user_id_user_id_fk FOREIGN KEY ("recipient_user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

