import { getDB } from '@/lib/db/index.js'
import { schema } from '@/lib/db/schema.js'

/**
 * A consistent test user for running tests.
 */
export const testUser = {
  id: 'usr_test_xxxxxxxx',
  email: 'test.user@example.com',
  name: 'Test User',
}

/**
 * Clears all data from the test database tables.
 * This function is designed to be called before seeding to ensure a clean state.
 * It deletes data in an order that respects foreign key constraints.
 */
export async function clearDatabase() {
  const db = getDB()

  // Delete from child tables first to avoid foreign key violations
  await db.delete(schema.period)

  // Delete from parent tables last
  await db.delete(schema.user)
}

/**
 * Seeds the database with a clean set of test data.
 * It first clears the database and then inserts the test user.
 * This is intended to be used in `beforeAll` or `beforeEach` hooks in test files.
 */
export async function seedTestDatabase() {
  await clearDatabase()

  const db = getDB()
  await db.insert(schema.user).values(testUser)
}
