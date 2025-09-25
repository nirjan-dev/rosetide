import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const demoUsersTable = sqliteTable('demo_users_table', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  age: int().notNull(),
  email: text().notNull().unique(),
})
