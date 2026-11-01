import { describe, expect, test } from 'vitest';
import type { RestorePointReason } from '@/lib/restorePoints';
import { isDailyRestorePointDue, restorePointsToPrune } from '@/lib/restorePoints';

const at = (day: number, hour = 9) => new Date(2026, 9, day, hour);

describe('restorePointsToPrune', () => {
  test('keeps the newest 7 daily copies and the newest 3 safety copies, in any order', () => {
    const daily = [5, 1, 9, 3, 7, 2, 8, 4, 6].map((day) => ({
      id: day,
      createdAt: at(day),
      reason: 'daily' as RestorePointReason,
    }));
    const safety = [
      { id: 101, createdAt: at(1, 12), reason: 'before-import' as RestorePointReason },
      { id: 102, createdAt: at(4, 12), reason: 'before-delete' as RestorePointReason },
      { id: 103, createdAt: at(6, 12), reason: 'before-restore' as RestorePointReason },
      { id: 104, createdAt: at(8, 12), reason: 'before-delete' as RestorePointReason },
      { id: 105, createdAt: at(2, 12), reason: 'before-import' as RestorePointReason },
    ];

    expect(restorePointsToPrune([...safety, ...daily]).sort((a, b) => a - b)).toEqual([1, 2, 101, 105]);
  });

  test('prunes nothing while under the limits', () => {
    expect(restorePointsToPrune([{ id: 1, createdAt: at(1), reason: 'daily' }])).toEqual([]);
  });
});

describe('isDailyRestorePointDue', () => {
  const now = at(10, 18);

  test('is due when there are no restore points yet', () => {
    expect(isDailyRestorePointDue([], 'records-a', now)).toBe(true);
  });

  test('is not due when the newest copy already matches the records', () => {
    expect(
      isDailyRestorePointDue([{ createdAt: at(3), reason: 'before-delete', signature: 'records-a' }], 'records-a', now),
    ).toBe(false);
  });

  test('takes at most one daily copy per day', () => {
    expect(
      isDailyRestorePointDue([{ createdAt: at(10, 8), reason: 'daily', signature: 'records-a' }], 'records-b', now),
    ).toBe(false);
  });

  test('is due on a new day once records changed', () => {
    expect(
      isDailyRestorePointDue([{ createdAt: at(9, 23), reason: 'daily', signature: 'records-a' }], 'records-b', now),
    ).toBe(true);
  });

  test('safety copies taken today do not count as the daily copy', () => {
    expect(
      isDailyRestorePointDue([{ createdAt: at(10, 8), reason: 'before-import', signature: 'records-a' }], 'records-b', now),
    ).toBe(true);
  });
});
