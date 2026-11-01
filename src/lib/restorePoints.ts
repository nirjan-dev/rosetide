import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Period, PeriodDay } from '@/modules/periods/types';
import { db } from '@/lib/db';
import { RESTORE_POINTS_DB_NAME } from '@/lib/storageNames';
import { toLocalDateString } from '@/utils/datetime';

export type RestorePointReason = 'daily' | 'before-import' | 'before-delete' | 'before-restore';

export interface RestorePoint {
  id?: number;
  createdAt: Date;
  reason: RestorePointReason;
  periods: Array<Period>;
  periodDays: Array<PeriodDay>;
  /** Serialized records, to skip copies identical to the newest point. */
  signature: string;
}

const DAILY_KEPT = 7;
const SAFETY_KEPT = 3;

class RestorePointDatabase extends Dexie {
  restorePoints!: Table<RestorePoint, number>;

  constructor() {
    super(RESTORE_POINTS_DB_NAME);
    this.version(1).stores({ restorePoints: '++id, createdAt' });
  }
}

export const restorePointDb = new RestorePointDatabase();

type PointSummary = Pick<RestorePoint, 'id' | 'createdAt' | 'reason'>;

/** Ids to delete so only the newest daily copies and the newest safety copies remain. */
export function restorePointsToPrune(points: Array<PointSummary>): Array<number> {
  const newestFirst = [...points].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const daily = newestFirst.filter((point) => point.reason === 'daily');
  const safety = newestFirst.filter((point) => point.reason !== 'daily');
  return [...daily.slice(DAILY_KEPT), ...safety.slice(SAFETY_KEPT)].flatMap((point) =>
    point.id === undefined ? [] : [point.id],
  );
}

/** A daily copy is due when records changed since the newest copy and none was taken today. */
export function isDailyRestorePointDue(
  points: Array<Pick<RestorePoint, 'createdAt' | 'reason' | 'signature'>>,
  currentSignature: string,
  now: Date,
): boolean {
  const newestFirst = [...points].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  if (newestFirst.at(0)?.signature === currentSignature) return false;
  const latestDaily = newestFirst.find((point) => point.reason === 'daily');
  return !latestDaily || toLocalDateString(latestDaily.createdAt) !== toLocalDateString(now);
}

async function readRecords(): Promise<Pick<RestorePoint, 'periods' | 'periodDays'>> {
  return db.transaction('r', db.periods, db.periodDays, async () => ({
    periods: await db.periods.toArray(),
    periodDays: await db.periodDays.toArray(),
  }));
}

async function saveRestorePoint(
  reason: RestorePointReason,
  records: Pick<RestorePoint, 'periods' | 'periodDays'>,
  signature: string,
  now: Date,
): Promise<void> {
  await restorePointDb.transaction('rw', restorePointDb.restorePoints, async () => {
    await restorePointDb.restorePoints.add({ createdAt: now, reason, signature, ...records });
    const points = await restorePointDb.restorePoints.toArray();
    await restorePointDb.restorePoints.bulkDelete(restorePointsToPrune(points));
  });
}

/** Takes today's automatic copy if records changed. Never copies an empty tracker. */
export async function createDailyRestorePointIfDue(now = new Date()): Promise<void> {
  const records = await readRecords();
  if (records.periods.length === 0 && records.periodDays.length === 0) return;
  const signature = JSON.stringify(records);
  const points = await restorePointDb.restorePoints.toArray();
  if (!isDailyRestorePointDue(points, signature, now)) return;
  await saveRestorePoint('daily', records, signature, now);
}

/** Copy taken right before a change someone might want to undo. */
export async function createSafetyRestorePoint(
  reason: Exclude<RestorePointReason, 'daily'>,
): Promise<void> {
  const records = await readRecords();
  if (records.periods.length === 0 && records.periodDays.length === 0) return;
  const signature = JSON.stringify(records);
  const newest = await restorePointDb.restorePoints.orderBy('createdAt').last();
  if (newest?.signature === signature) return;
  await saveRestorePoint(reason, records, signature, new Date());
}

/** Replaces all records with the chosen copy, after saving a copy of the current ones. */
export async function restoreFromRestorePoint(id: number): Promise<void> {
  const point = await restorePointDb.restorePoints.get(id);
  if (!point) throw new Error('That restore point no longer exists.');
  await createSafetyRestorePoint('before-restore');
  await db.transaction('rw', db.periods, db.periodDays, async () => {
    await db.periodDays.clear();
    await db.periods.clear();
    await db.periods.bulkAdd(point.periods);
    await db.periodDays.bulkAdd(point.periodDays);
  });
}

export async function deleteAllRestorePoints(): Promise<void> {
  restorePointDb.close();
  await restorePointDb.delete();
}
