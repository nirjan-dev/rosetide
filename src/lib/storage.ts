import { db } from '@/lib/db';
import { BACKUP_REMINDER_SNOOZE_KEY } from '@/lib/backupFile';
import { EARLIEST_DB_NAME, EARLIEST_IMPORTED_KEY } from '@/lib/legacyRescue';
import { deleteAllRestorePoints } from '@/lib/restorePoints';
import { LAST_BACKUP_FILE_KEY } from '@/lib/storageNames';

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

/**
 * Installed apps ask once per launch. Chrome decides without a prompt and normally grants
 * it to installed apps, so their records aren't cleared when the device runs low on space.
 */
export async function protectStorageInInstalledApp(): Promise<void> {
  if (!window.matchMedia('(display-mode: standalone)').matches) return;
  const { persisted } = await checkPersistedStorage();
  if (!persisted) await requestPersistedStorage();
}

export async function deleteAllLocalData(): Promise<void> {
  db.close();
  await db.delete();
  await deleteAllRestorePoints();
  // Records from the earliest build live in their own database; delete those too.
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(EARLIEST_DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
  localStorage.removeItem(LAST_BACKUP_FILE_KEY);
  localStorage.removeItem(BACKUP_REMINDER_SNOOZE_KEY);
  localStorage.removeItem(EARLIEST_IMPORTED_KEY);
}