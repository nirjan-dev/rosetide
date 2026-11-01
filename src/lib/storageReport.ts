/**
 * Read-only view of everything this browser stores for the current address.
 * Never opens Dexie, never upgrades a database, and never creates one: a probe that
 * would create a missing database is aborted before anything is written.
 */

// Databases every Rosetide version has used; probed when the browser can't list databases.
const KNOWN_DATABASES = ['periodos_db', 'Database'];

export interface StoreReport {
  name: string;
  count: number;
  firstDate: Date | null;
  lastDate: Date | null;
}

export interface DatabaseReport {
  name: string;
  version: number;
  stores: Array<StoreReport>;
}

export interface StorageReport {
  origin: string;
  databases: Array<DatabaseReport>;
  usageBytes: number | null;
  indexedDbBytes: number | null;
  persisted: boolean | null;
  localStorageKeys: Array<string>;
  lastExport: Date | null;
  errors: Array<string>;
}

export interface RawBackup {
  origin: string;
  exportedAt: string;
  databases: Record<string, { version: number; stores: Record<string, Array<unknown>> }>;
  localStorage: Record<string, string | null>;
}

// Executor form on purpose: Promise.withResolvers needs Safari 17.4+.
function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Opens an existing database without changing it; resolves null if it doesn't exist. */
function openExisting(name: string): Promise<IDBDatabase | null> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name);
    let missing = false;
    req.onupgradeneeded = (event) => {
      if (event.oldVersion === 0) {
        // Opening would create the database: abort so nothing is created.
        missing = true;
        req.transaction?.abort();
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      if (missing) resolve(null);
      else reject(req.error ?? new Error(`Could not open ${name}`));
    };
  });
}

async function databaseNames(): Promise<Array<string>> {
  if (typeof indexedDB.databases !== 'function') return KNOWN_DATABASES;
  const listed = await indexedDB.databases();
  return listed.flatMap((database) => (database.name ? [database.name] : []));
}

function recordDate(record: unknown): Date | null {
  if (typeof record !== 'object' || record === null) return null;
  for (const field of ['startDate', 'date']) {
    const value: unknown = Reflect.get(record, field);
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  }
  return null;
}

async function readAll(database: IDBDatabase, storeName: string): Promise<Array<unknown>> {
  return request(database.transaction(storeName, 'readonly').objectStore(storeName).getAll());
}

function readLocalStorage(): Record<string, string | null> {
  const values: Record<string, string | null> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key !== null) values[key] = localStorage.getItem(key);
  }
  return values;
}

export async function collectStorageReport(): Promise<StorageReport> {
  const report: StorageReport = {
    origin: window.location.origin,
    databases: [],
    usageBytes: null,
    indexedDbBytes: null,
    persisted: null,
    localStorageKeys: [],
    lastExport: null,
    errors: [],
  };

  try {
    for (const name of await databaseNames()) {
      const database = await openExisting(name);
      if (!database) continue;
      const stores: Array<StoreReport> = [];
      for (const storeName of database.objectStoreNames) {
        const records = await readAll(database, storeName);
        const dates = records.flatMap((record) => {
          const date = recordDate(record);
          return date ? [date] : [];
        });
        dates.sort((a, b) => a.getTime() - b.getTime());
        stores.push({
          name: storeName,
          count: records.length,
          firstDate: dates.at(0) ?? null,
          lastDate: dates.at(-1) ?? null,
        });
      }
      report.databases.push({ name, version: database.version, stores });
      database.close();
    }
  } catch (error) {
    report.errors.push(`Saved records: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const estimate: StorageEstimate & { usageDetails?: { indexedDB?: number } } =
      await navigator.storage.estimate();
    report.usageBytes = estimate.usage ?? null;
    report.indexedDbBytes = estimate.usageDetails?.indexedDB ?? null;
    report.persisted = await navigator.storage.persisted();
  } catch (error) {
    report.errors.push(`Storage size: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const values = readLocalStorage();
    report.localStorageKeys = Object.keys(values);
    const lastExport = values.periodos_last_export;
    if (lastExport) report.lastExport = new Date(lastExport);
  } catch (error) {
    report.errors.push(`Settings: ${error instanceof Error ? error.message : String(error)}`);
  }

  return report;
}

/** Every record from every database, as stored, for safekeeping or manual recovery. */
export async function collectRawBackup(): Promise<RawBackup> {
  const backup: RawBackup = {
    origin: window.location.origin,
    exportedAt: new Date().toISOString(),
    databases: {},
    localStorage: readLocalStorage(),
  };
  for (const name of await databaseNames()) {
    const database = await openExisting(name);
    if (!database) continue;
    const stores: Record<string, Array<unknown>> = {};
    for (const storeName of database.objectStoreNames) {
      stores[storeName] = await readAll(database, storeName);
    }
    backup.databases[name] = { version: database.version, stores };
    database.close();
  }
  return backup;
}
