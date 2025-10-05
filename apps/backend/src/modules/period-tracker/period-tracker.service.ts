import { eq, and, desc, isNotNull, isNull } from 'drizzle-orm'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import type { schema } from '@/lib/db/schema.js'
import { period } from '@/lib/db/schema.js'

export interface Period {
  id: string
  userId: string
  startDate: Date
  endDate: Date | null
  createdAt: Date
  updatedAt: Date
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class PeriodTrackerService {
  static async createPeriod(db: LibSQLDatabase<typeof schema>, data: { userId: string, startDate: Date }) {
    const result = await db.insert(period).values({
      id: crypto.randomUUID(),
      userId: data.userId,
      startDate: data.startDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

    return result[0]
  }

  static async updatePeriod(db: LibSQLDatabase<typeof schema>, id: string, data: { endDate: Date }) {
    const result = await db.update(period)
      .set({
        endDate: data.endDate,
        updatedAt: new Date(),
      })
      .where(eq(period.id, id))
      .returning()

    return result[0]
  }

  static async getActivePeriod(db: LibSQLDatabase<typeof schema>, userId: string) {
    const result = await db.select()
      .from(period)
      .where(and(
        eq(period.userId, userId),
        isNull(period.endDate),
      ))
      .limit(1)

    if (result.length === 0) {
      return null
    }

    return result[0]
  }

  static async getPeriods(db: LibSQLDatabase<typeof schema>, userId: string) {
    return await db.select()
      .from(period)
      .where(eq(period.userId, userId))
      .orderBy(desc(period.startDate))
  }

  static async getPeriodById(db: LibSQLDatabase<typeof schema>, id: string) {
    const result = await db.select()
      .from(period)
      .where(eq(period.id, id))
      .limit(1)

    return result[0] || null
  }

  static async getPastPeriods(db: LibSQLDatabase<typeof schema>, userId: string, limit: number = 10) {
    return await db.select()
      .from(period)
      .where(and(
        eq(period.userId, userId),
        isNotNull(period.endDate),
      ))
      .orderBy(desc(period.startDate))
      .limit(limit)
  }
}
