import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import type { Context } from 'hono'
import { getEnv } from '../env.js'
import { getDB } from './db/index.js'
import { schema } from './db/schema.js'

export const auth = (c: Context) => betterAuth({
  database: drizzleAdapter(getDB(c), {
    provider: 'sqlite',
    schema,
  }),
  socialProviders: {
    google: {
      clientId: getEnv(c).GOOGLE_CLIENT_ID,
      clientSecret: getEnv(c).GOOGLE_CLIENT_SECRET,
    },
  },
  trustedOrigins: [
    getEnv(c).FRONTEND_URL,
  ],
  advanced: {
    // TODO: remove when you start using the same domain/subdomain for backend and frontend
    defaultCookieAttributes: {
      sameSite: 'None',
      secure: true,
      httpOnly: true,
    },
  },
})
