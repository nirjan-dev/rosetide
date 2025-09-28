import { eq, and, desc, lt, gte } from 'drizzle-orm'
import { period } from './schema'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'

export interface Period {
  id: string
  userId: string
  startDate: Date
  endDate: Date | null
  createdAt: Date
  updatedAt: Date
}

export const createPeriod = async (db: LibSQLDatabase<any>, data: { userId: string; startDate: Date }) => {
  const result = await db.insert(period).values({
    id: crypto.randomUUID(),
    userId: data.userId,
    startDate: data.startDate,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning()

  return result[0]
}

export const updatePeriod = async (db: LibSQLDatabase<any>, id: string, data: { endDate: Date }) => {
  const result = await db.update(period)
    .set({
      endDate: data.endDate,
      updatedAt: new Date(),
    })
    .where(eq(period.id, id))
    .returning()

  return result[0]
}

export const getActivePeriod = async (db: LibSQLDatabase<any>, userId: string) => {
  const result = await db.select()
    .from(period)
    .where(and(
      eq(period.userId, userId),
      eq(period.endDate, null)
    ))
    .limit(1)

  return result[0] || null
}

export const getPeriods = async (db: LibSQLDatabase<any>, userId: string) => {
  return await db.select()
    .from(period)
    .where(eq(period.userId, userId))
    .orderBy(desc(period.startDate))
}

export const getPeriodById = async (db: LibSQLDatabase<any>, id: string) => {
  const result = await db.select()
    .from(period)
    .where(eq(period.id, id))
    .limit(1)

  return result[0] || null
}

export const getPastPeriods = async (db: LibSQLDatabase<any>, userId: string, limit: number = 10) => {
  return await db.select()
    .from(period)
    .where(and(
      eq(period.userId, userId),
      period.endDate.isNotNull()
    ))
    .orderBy(desc(period.startDate))
    .limit(limit)
}
