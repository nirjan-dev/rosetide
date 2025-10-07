import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { getEnv } from '@/env.js'

const url = getEnv().DATABASE_URL

const db = drizzle({
  connection: {
    url,
  },
})

export const runMigrations = () => migrate(db, {
  migrationsFolder: './migrations',
})
