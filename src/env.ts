import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  /*
   * Specify what prefix the client-side variables must have.
   * This is enforced both on type-level and at runtime.
   */
  clientPrefix: "NEXT_PUBLIC_",
  server: {
    /**
     * The main Database Host
     */
    DATABASE_HOST: z.string(),
    /**
     * The port to use when connecting to the database
     */
    DATABASE_PORT: z.coerce.number(),
    /**
     * The name of the Main database app Data should be stored in
     */
    DATABASE_NAME: z.string(),
    /**
     * The name of the Master database that is used for migrations etc
     */
    DATABASE_MASTER_NAME: z.string(),
    /**
     * The username to use when connecting to the database
     */
    DATABASE_USERNAME: z.string(),
    /**
     * The password to use when connecting to the database
     */
    DATABASE_PASSWORD: z.string(),
    /**
     * The full Database URL
     */
    DATABASE_URL: z.string().url(),
    /**
     * The full Database Master URL to use for migrations etc
     */
    DATABASE_MASTER_URL: z.string().url(),
  },
  client: {},
  /**
   * What object holds the environment variables at runtime.
   * Often `process.env` or `import.meta.env`
   */
  runtimeEnv: process.env,
});
