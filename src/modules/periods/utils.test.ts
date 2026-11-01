import { describe, expect, test } from 'vitest';
import { calculatePeriodAnalytics } from '@/modules/periods/utils';

describe('calculatePeriodAnalytics', () => {
  test('requires two completed periods before predicting', () => {
    const result = calculatePeriodAnalytics([
      { startDate: new Date(2026, 8, 3), endDate: new Date(2026, 8, 7) },
    ]);

    expect(result.hasSufficientData).toBe(false);
    expect(result.predictedStartDate).toBeNull();
  });

  test('predicts from the most recent start date and average cycle', () => {
    const result = calculatePeriodAnalytics([
      { startDate: new Date(2026, 7, 5), endDate: new Date(2026, 7, 9) },
      { startDate: new Date(2026, 8, 2), endDate: new Date(2026, 8, 6) },
      { startDate: new Date(2026, 8, 30), endDate: new Date(2026, 9, 3) },
    ]);

    expect(result.hasSufficientData).toBe(true);
    expect(result.averageCycleLength).toBe(28);
    expect(result.confidenceLevel).toBe('low');
    expect(result.predictedStartDate).toEqual(new Date(2026, 9, 28));
  });
});
