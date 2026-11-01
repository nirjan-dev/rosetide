import { describe, expect, test } from 'vitest';
import { groupEarliestLogs } from '@/lib/legacyRescue';

describe('groupEarliestLogs', () => {
  test('closes a period at the day marked as ended', () => {
    const periods = groupEarliestLogs([
      { date: new Date(2025, 8, 25), flowIntensity: 2 },
      { date: new Date(2025, 8, 26), flowIntensity: 4 },
      { date: new Date(2025, 8, 29), flowIntensity: 1, isEnded: true },
      { date: new Date(2025, 9, 1), flowIntensity: 3 },
    ]);

    expect(periods).toHaveLength(2);
    expect(periods[0].startDate).toEqual(new Date(2025, 8, 25));
    expect(periods[0].endDate).toEqual(new Date(2025, 8, 29));
    expect(periods[0].days.map((day) => day.flowIntensity)).toEqual([2, 4, 1]);
    expect(periods[1].startDate).toEqual(new Date(2025, 9, 1));
  });

  test('splits on long gaps and closes unfinished periods at their last logged day', () => {
    const periods = groupEarliestLogs([
      { date: new Date(2025, 9, 19), flowIntensity: 2 },
      { date: new Date(2025, 8, 1), flowIntensity: 3 },
      { date: new Date(2025, 8, 2), flowIntensity: 3 },
      { date: new Date(2025, 9, 18), flowIntensity: 3 },
    ]);

    expect(periods.map((period) => [period.startDate, period.endDate])).toEqual([
      [new Date(2025, 8, 1), new Date(2025, 8, 2)],
      [new Date(2025, 9, 18), new Date(2025, 9, 19)],
    ]);
  });

  test('keeps one entry per day and clamps out-of-range flow', () => {
    const [period] = groupEarliestLogs([
      { date: new Date(2025, 8, 1, 9), flowIntensity: 9 },
      { date: new Date(2025, 8, 1, 21), flowIntensity: 2 },
      { date: new Date(2025, 8, 2), flowIntensity: Number.NaN },
    ]);

    expect(period.days.map((day) => day.flowIntensity)).toEqual([5, 1]);
  });
});
