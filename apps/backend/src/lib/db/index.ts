import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import { getEnv } from '@/env.js'
import { schema } from '@/lib/db/schema.js'
const url = getEnv().DATABASE_URL
if (!url) {
  throw new Error('DATABASE_URL is not set')
}

export const db = drizzle({
  connection: {
    url,
  },
  schema,
  logger: true,
})
