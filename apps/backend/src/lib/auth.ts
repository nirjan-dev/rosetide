import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { getEnv } from '@/env.js'
import { db } from '@/lib/db/index.js'
import { schema } from '@/lib/db/schema.js'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema,
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 10 * 60,
    },
  },
  socialProviders: {
    google: {
      clientId: getEnv().GOOGLE_CLIENT_ID,
      clientSecret: getEnv().GOOGLE_CLIENT_SECRET,
    },
  },
  trustedOrigins: [
    getEnv().FRONTEND_URL,
  ],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: getEnv().COOKIE_DOMAIN,
    },
  },
})
