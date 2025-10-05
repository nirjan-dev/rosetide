import { createEnv } from '@t3-oss/env-core'
import type { Context } from 'hono'
import { env } from 'hono/adapter'
import { z } from 'zod'
export const getEnv = (c: Context) => createEnv({
  server: {
    FRONTEND_URL: z.string().url(),
    DATABASE_URL: z.string(),
    COOKIE_DOMAIN: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.string().url(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    LOG_LEVEL: z.string().optional(),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  runtimeEnv: env(c),

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
})
