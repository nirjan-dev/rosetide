import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import type { Context } from 'hono'
import { getEnv } from '../../env.js'
import { schema } from './schema.js'

export const getDB = (c: Context) => drizzle(getEnv(c).DB_FILE_NAME, {
  schema: schema,
})
