import { db } from '@/lib/db';
import { EARLIEST_DB_NAME, EARLIEST_IMPORTED_KEY } from '@/lib/legacyRescue';

export interface StorageStatus {
  persisted: boolean;
  isRequesting: boolean;
}

export interface StorageEstimate {
  usage: number;
  quota: number;
  percentage: number;
}

export async function requestPersistedStorage(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('storage' in navigator)) {
    return false;
  }

  try {
    if (typeof navigator.storage.persist !== 'function') {
      return await navigator.storage.persisted();
    }
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

export async function checkPersistedStorage(): Promise<StorageStatus> {
  if (typeof navigator === 'undefined' || !('storage' in navigator)) {
    return { persisted: false, isRequesting: false };
  }
  
  try {
    const persisted = await navigator.storage.persisted();
    return { persisted, isRequesting: false };
  } catch {
    return { persisted: false, isRequesting: false };
  }
}

export async function getStorageEstimate(): Promise<StorageEstimate | null> {
  if (typeof navigator === 'undefined') {
    return null;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (typeof navigator.storage?.estimate !== 'function') {
    return null;
  }
  
  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage ?? 0;
    const quota = estimate.quota ?? 0;
    const percentage = quota > 0 ? (usage / quota) * 100 : 0;
    
    return { usage, quota, percentage };
  } catch {
    return null;
  }
}

const LAST_EXPORT_KEY = 'periodos_last_export';

export function getLastExportDate(): string | null {
  return localStorage.getItem(LAST_EXPORT_KEY);
}

export function setLastExportDate(date: Date): void {
  localStorage.setItem(LAST_EXPORT_KEY, date.toISOString());
}

export async function deleteAllLocalData(): Promise<void> {
  db.close();
  await db.delete();
  // Records from the earliest build live in their own database; delete those too.
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(EARLIEST_DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
  localStorage.removeItem(LAST_EXPORT_KEY);
  localStorage.removeItem(EARLIEST_IMPORTED_KEY);
}