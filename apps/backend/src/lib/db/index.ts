import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import type { Context } from 'hono'
import { getEnv } from '@/env.js'
import { schema } from '@/lib/db/schema.js'

export const getDB = (c?: Context) => {
  const url = c ? getEnv(c).DATABASE_URL : process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return drizzle(url, {
    schema,
  })
}
