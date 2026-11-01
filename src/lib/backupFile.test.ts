import { describe, expect, test } from 'vitest';
import { isBackupReminderDue } from '@/lib/backupFile';

const now = new Date(2026, 10, 1, 12);
const daysAgo = (days: number) => new Date(2026, 10, 1 - days, 12);

describe('isBackupReminderDue', () => {
  test('stays hidden until there are records to back up', () => {
    expect(isBackupReminderDue(false, null, null, now)).toBe(false);
  });

  test('shows when records were never backed up', () => {
    expect(isBackupReminderDue(true, null, null, now)).toBe(true);
  });

  test('shows again 30 days after the last backup file', () => {
    expect(isBackupReminderDue(true, daysAgo(29), null, now)).toBe(false);
    expect(isBackupReminderDue(true, daysAgo(30), null, now)).toBe(true);
  });

  test('stays hidden while snoozed, and returns when the snooze ends', () => {
    expect(isBackupReminderDue(true, null, daysAgo(-3), now)).toBe(false);
    expect(isBackupReminderDue(true, null, daysAgo(1), now)).toBe(true);
  });
});
