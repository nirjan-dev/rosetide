import { db } from '@/lib/db';
import { toLocalDateString } from '@/utils/datetime';

/**
 * Older Rosetide builds stored records in shapes the current schema cannot read:
 *
 * - Oct 16-22 2025: a separate "Database" with one `cycles` row per logged day.
 * - Oct 22 - Nov 8 2025: "periodos_db" with a `cycles` store and `periodDays.cycleId`.
 *
 * The Nov 2025 rename kept Dexie at version 1, so Dexie's schema patch deletes the
 * `cycles` store the first time the current schema opens such a database. This module
 * moves those records into the current shape *before* Dexie opens, and never deletes
 * legacy data itself.
 */

export const CURRENT_DB_NAME = 'periodos_db';
export const EARLIEST_DB_NAME = 'Database';
export const EARLIEST_IMPORTED_KEY = 'rosetide_earliest_records_imported';

const DAY_MS = 24 * 60 * 60 * 1000;
// A logged day more than this far from the previous one starts a new period.
const MAX_GAP_DAYS = 10;

interface LegacyCycle {
  id: number;
  startDate: Date;
  endDate?: Date;
}

interface LegacyPeriodDay {
  id: number;
  cycleId?: number;
  periodId?: number;
  date: Date;
  flowIntensity: number;
}

export interface EarliestLog {
  date: Date;
  flowIntensity?: number;
  isEnded?: boolean;
}

export interface RecoveredPeriod {
  startDate: Date;
  endDate: Date;
  days: Array<{ date: Date; flowIntensity: number }>;
}

// Executor form on purpose: Promise.withResolvers needs Safari 17.4+.
function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function openDatabase(
  name: string,
  version?: number,
  upgrade?: (database: IDBDatabase, transaction: IDBTransaction) => void,
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = version === undefined ? indexedDB.open(name) : indexedDB.open(name, version);
    req.onupgradeneeded = () => {
      if (upgrade && req.transaction) upgrade(req.result, req.transaction);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error(`Could not open ${name}`));
  });
}

async function databaseExists(name: string): Promise<boolean> {
  if (typeof indexedDB.databases !== 'function') return false;
  const databases = await indexedDB.databases();
  return databases.some((database) => database.name === name);
}

/** Groups the earliest one-row-per-day logs into periods. */
export function groupEarliestLogs(logs: Array<EarliestLog>): Array<RecoveredPeriod> {
  const sorted = logs
    .filter((log) => log.date instanceof Date && !Number.isNaN(log.date.getTime()))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const periods: Array<RecoveredPeriod> = [];
  let current: RecoveredPeriod | null = null;

  for (const log of sorted) {
    if (current && (log.date.getTime() - current.endDate.getTime()) / DAY_MS > MAX_GAP_DAYS) {
      periods.push(current);
      current = null;
    }
    current ??= { startDate: log.date, endDate: log.date, days: [] };

    const logDay = toLocalDateString(log.date);
    if (!current.days.some((day) => toLocalDateString(day.date) === logDay)) {
      const flow =
        typeof log.flowIntensity === 'number' && Number.isFinite(log.flowIntensity)
          ? Math.round(log.flowIntensity)
          : 1;
      current.days.push({ date: log.date, flowIntensity: Math.min(5, Math.max(1, flow)) });
    }
    current.endDate = log.date;

    if (log.isEnded) {
      periods.push(current);
      current = null;
    }
  }
  if (current) periods.push(current);
  return periods;
}

/**
 * Runs inside the version-change transaction, so it either fully applies or not at all.
 * Copies legacy `cycles` into `periods`, rebuilds periods whose `cycles` rows were
 * already removed from their surviving daily logs, and links every legacy daily log.
 */
async function migrateCurrentDatabase(database: IDBDatabase, tx: IDBTransaction): Promise<void> {
  if (!database.objectStoreNames.contains('periods')) {
    const periods = database.createObjectStore('periods', { keyPath: 'id', autoIncrement: true });
    periods.createIndex('startDate', 'startDate');
    periods.createIndex('endDate', 'endDate');
  }
  if (!database.objectStoreNames.contains('periodDays')) {
    database.createObjectStore('periodDays', { keyPath: 'id', autoIncrement: true });
  }
  const periodsStore = tx.objectStore('periods');
  const daysStore = tx.objectStore('periodDays');
  if (!daysStore.indexNames.contains('periodId')) daysStore.createIndex('periodId', 'periodId');
  if (!daysStore.indexNames.contains('date')) daysStore.createIndex('date', 'date');

  const existing = (await request(periodsStore.getAll())) as Array<LegacyCycle>;
  const idByStartDay = new Map(existing.map((period) => [toLocalDateString(period.startDate), period.id]));

  const cycles = database.objectStoreNames.contains('cycles')
    ? ((await request(tx.objectStore('cycles').getAll())) as Array<LegacyCycle>)
    : [];
  const orphanDays = ((await request(daysStore.getAll())) as Array<LegacyPeriodDay>).filter(
    (day): day is LegacyPeriodDay & { cycleId: number } =>
      typeof day.periodId !== 'number' && typeof day.cycleId === 'number',
  );

  const firstDayByCycle = new Map<number, Date>();
  const lastDayByCycle = new Map<number, Date>();
  for (const day of orphanDays) {
    const first = firstDayByCycle.get(day.cycleId);
    const last = lastDayByCycle.get(day.cycleId);
    if (!first || day.date < first) firstDayByCycle.set(day.cycleId, day.date);
    if (!last || day.date > last) lastDayByCycle.set(day.cycleId, day.date);
  }

  const addPeriod = async (startDate: Date, endDate: Date): Promise<number> => {
    const startDay = toLocalDateString(startDate);
    const existingId = idByStartDay.get(startDay);
    if (existingId !== undefined) return existingId;
    const id = (await request(periodsStore.add({ startDate, endDate }))) as number;
    idByStartDay.set(startDay, id);
    return id;
  };

  const periodIdByCycle = new Map<number, number>();
  for (const cycle of cycles) {
    // Legacy builds are long gone, so a legacy period without an end date is stale, not ongoing.
    const endDate = cycle.endDate ?? lastDayByCycle.get(cycle.id) ?? cycle.startDate;
    periodIdByCycle.set(cycle.id, await addPeriod(cycle.startDate, endDate));
  }
  for (const [cycleId, firstDay] of firstDayByCycle) {
    if (periodIdByCycle.has(cycleId)) continue;
    periodIdByCycle.set(cycleId, await addPeriod(firstDay, lastDayByCycle.get(cycleId) ?? firstDay));
  }
  for (const day of orphanDays) {
    await request(daysStore.put({ ...day, periodId: periodIdByCycle.get(day.cycleId) }));
  }
}

/**
 * Must run before Dexie opens the current database. Leaves `cycles` in place as a
 * backup; Dexie ignores extra stores and indexes once the current schema exists.
 * Throws if legacy records exist but could not be moved — callers must not open Dexie then.
 */
export async function rescueLegacyCurrentDatabase(): Promise<void> {
  if (!(await databaseExists(CURRENT_DB_NAME))) return;

  const database = await openDatabase(CURRENT_DB_NAME);
  const hasCycles = database.objectStoreNames.contains('cycles');
  const hasPeriods = database.objectStoreNames.contains('periods');
  let hasOrphanDays = false;
  if (database.objectStoreNames.contains('periodDays')) {
    const daysStore = database.transaction('periodDays', 'readonly').objectStore('periodDays');
    if (daysStore.indexNames.contains('cycleId')) {
      const legacyDays = (await request(daysStore.index('cycleId').getAll())) as Array<LegacyPeriodDay>;
      hasOrphanDays = legacyDays.some((day) => typeof day.periodId !== 'number');
    }
  }
  const version = database.version;
  database.close();

  if (!(hasCycles && !hasPeriods) && !hasOrphanDays) return;

  const migrated = await openDatabase(CURRENT_DB_NAME, version + 1, (upgraded, tx) => {
    migrateCurrentDatabase(upgraded, tx).catch((error: unknown) => {
      console.error('Legacy record migration failed:', error);
      tx.abort();
    });
  });
  migrated.close();
}

/**
 * Imports the earliest "Database" records into the opened current database.
 * Skips periods whose start day already exists and leaves "Database" untouched.
 */
export async function importEarliestRecords(): Promise<void> {
  try {
    if (localStorage.getItem(EARLIEST_IMPORTED_KEY) === '1') return;
  } catch {
    // Storage unavailable: start-day de-duplication still prevents duplicates.
  }
  if (!(await databaseExists(EARLIEST_DB_NAME))) return;

  const earliest = await openDatabase(EARLIEST_DB_NAME);
  const logs = earliest.objectStoreNames.contains('cycles')
    ? ((await request(earliest.transaction('cycles', 'readonly').objectStore('cycles').getAll())) as Array<EarliestLog>)
    : [];
  earliest.close();

  const periods = groupEarliestLogs(logs);
  await db.transaction('rw', db.periods, db.periodDays, async () => {
    const existingStartDays = new Set(
      (await db.periods.toArray()).map((period) => toLocalDateString(period.startDate)),
    );
    for (const period of periods) {
      if (existingStartDays.has(toLocalDateString(period.startDate))) continue;
      const periodId = (await db.periods.add({ startDate: period.startDate, endDate: period.endDate })) as number;
      await db.periodDays.bulkAdd(
        period.days.map((day) => ({ periodId, date: day.date, flowIntensity: day.flowIntensity })),
      );
    }
  });

  try {
    localStorage.setItem(EARLIEST_IMPORTED_KEY, '1');
  } catch {
    // See above.
  }
}
