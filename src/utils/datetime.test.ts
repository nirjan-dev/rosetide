import { describe, expect, test } from 'vitest';
import { parseLocalDateString, toLocalDateString } from '@/utils/datetime';

describe('local date helpers', () => {
  test('formats a local date without UTC shifting it', () => {
    const date = new Date(2026, 9, 29);
    expect(toLocalDateString(date)).toBe('2026-10-29');
  });

  test('parses a calendar date as local midnight', () => {
    const parsed = parseLocalDateString('2026-10-29');
    expect(parsed).not.toBeNull();
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(9);
    expect(parsed?.getDate()).toBe(29);
    expect(parsed?.getHours()).toBe(0);
  });

  test('rejects malformed and impossible dates', () => {
    expect(parseLocalDateString('not-a-date')).toBeNull();
    expect(parseLocalDateString('2026-13-01')).toBeNull();
    expect(parseLocalDateString('2026-02-30')).toBeNull();
  });
});
