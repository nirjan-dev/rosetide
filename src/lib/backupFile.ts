import { addDays, format } from 'date-fns';
import { downloadCSV, exportToCSV } from '@/lib/export';
import { LAST_BACKUP_FILE_KEY } from '@/lib/storageNames';

export const BACKUP_REMINDER_SNOOZE_KEY = 'rosetide_backup_reminder_snoozed_until';
const REMIND_AFTER_DAYS = 30;
const SNOOZE_DAYS = 7;

const listeners = new Set<() => void>();

function readKey(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeKey(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode): the backup itself still happened.
  }
  for (const listener of listeners) listener();
}

/** ISO date of the last saved or shared backup file, or null. A string so React can compare it. */
export function getLastBackupFileDate(): string | null {
  return readKey(LAST_BACKUP_FILE_KEY);
}

export function getBackupReminderSnoozedUntil(): string | null {
  return readKey(BACKUP_REMINDER_SNOOZE_KEY);
}

export function subscribeBackupFile(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

export function snoozeBackupReminder(now = new Date()): void {
  writeKey(BACKUP_REMINDER_SNOOZE_KEY, addDays(now, SNOOZE_DAYS).toISOString());
}

export function isBackupReminderDue(
  hasRecords: boolean,
  lastBackup: Date | null,
  snoozedUntil: Date | null,
  now: Date,
): boolean {
  if (!hasRecords) return false;
  if (snoozedUntil && snoozedUntil > now) return false;
  return !lastBackup || addDays(lastBackup, REMIND_AFTER_DAYS) <= now;
}

function backupFileName(date: Date): string {
  return `periodos-backup-${format(date, 'yyyy-MM-dd')}.csv`;
}

/** Downloads a backup file to this device. */
export async function saveBackupFile(): Promise<void> {
  const now = new Date();
  downloadCSV(await exportToCSV(), backupFileName(now));
  writeKey(LAST_BACKUP_FILE_KEY, now.toISOString());
}

export function canShareBackupFile(): boolean {
  if (!('canShare' in navigator)) return false;
  return navigator.canShare({ files: [new File([''], 'backup.csv', { type: 'text/csv' })] });
}

/** Opens the share sheet so the file can go to Drive, email or messages. False if cancelled. */
export async function shareBackupFile(): Promise<boolean> {
  const now = new Date();
  const file = new File([await exportToCSV()], backupFileName(now), { type: 'text/csv' });
  try {
    await navigator.share({ files: [file], title: 'Rosetide backup' });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return false;
    throw error;
  }
  writeKey(LAST_BACKUP_FILE_KEY, now.toISOString());
  return true;
}
