import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const db = drizzle(process.env.DATABASE_URL!)

export const runMigrations = () => migrate(db, {
  migrationsFolder: './migrations',
})
