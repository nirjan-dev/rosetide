import type { Period } from '@/modules/periods/types';

// #region Date Utilities
// These are simple, date-fns-like utilities to avoid adding a dependency for now.

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Calculates the difference in full days between two dates, ignoring time and timezone.
 * @param dateLeft The later date.
 * @param dateRight The earlier date.
 * @returns The number of full days between the two dates.
 */
function differenceInDays(dateLeft: Date, dateRight: Date): number {
  const utcLeft = Date.UTC(
    dateLeft.getFullYear(),
    dateLeft.getMonth(),
    dateLeft.getDate(),
  );
  const utcRight = Date.UTC(
    dateRight.getFullYear(),
    dateRight.getMonth(),
    dateRight.getDate(),
  );

  return Math.floor((utcLeft - utcRight) / MS_PER_DAY);
}

/**
 * Adds a specified number of days to a date.
 * @param date The date to add days to.
 * @param amount The number of days to add.
 * @returns A new Date object with the days added.
 */
function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}
// #endregion

export interface PredictionAnalytics {
  predictedStartDate: Date | null;
  averageCycleLength: number | null;
  confidenceLevel: 'low' | 'medium' | 'high' | null;
  hasSufficientData: boolean;
  cycleLengths: Array<number>;
  completedPeriodsCount: number;
}

/**
 * Calculates menstrual cycle analytics, including the predicted next start date,
 * average cycle length, and a confidence score.
 *
 * @param periods - An array of `Period` objects.
 *                  IMPORTANT: This array MUST be sorted by `startDate` in ascending order.
 * @returns An object containing the calculated prediction analytics.
 */
export const calculatePeriodAnalytics = (
  periods: Array<Period>,
): PredictionAnalytics => {
  // Filter for completed periods (those with a defined start and end date).
  const completedPeriods = periods.filter(p => p.endDate);
  const completedPeriodsCount = completedPeriods.length;

  // Check for sufficient data. We need at least two completed periods
  // to calculate the length of one cycle between them.
  if (completedPeriodsCount < 2) {
    return {
      predictedStartDate: null,
      averageCycleLength: null,
      confidenceLevel: null,
      hasSufficientData: false,
      cycleLengths: [],
      completedPeriodsCount,
    };
  }

  // Calculate the length of each cycle. A cycle is the duration from the
  // start date of one period to the start date of the next consecutive one.
  const cycleLengths: Array<number> = [];
  for (let i = 0; i < completedPeriodsCount - 1; i++) {
    const currentPeriod = completedPeriods[i];
    const nextPeriod = completedPeriods[i + 1];
    const cycleLength = differenceInDays(
      nextPeriod.startDate,
      currentPeriod.startDate,
    );
    cycleLengths.push(cycleLength);
  }

  // This case should be covered by the initial check, but as a safeguard:
  if (cycleLengths.length === 0) {
    return {
      predictedStartDate: null,
      averageCycleLength: null,
      confidenceLevel: null,
      hasSufficientData: false,
      cycleLengths: [],
      completedPeriodsCount,
    };
  }

  // Calculate the average cycle length, rounded to the nearest whole number.
  const totalCycleDays = cycleLengths.reduce((sum, length) => sum + length, 0);
  const averageCycleLength = Math.round(totalCycleDays / cycleLengths.length);

  //  Predict the next period's start date. This is based on the start date
  // of the most recent period logged, which is the last one in the sorted array.
  const lastPeriod = periods[periods.length - 1];
  const predictedStartDate = addDays(lastPeriod.startDate, averageCycleLength);

  //  Determine the confidence level based on the number of completed periods.
  let confidenceLevel: 'low' | 'medium' | 'high';
  if (completedPeriodsCount >= 7) {
    confidenceLevel = 'high';
  } else if (completedPeriodsCount >= 4) {
    confidenceLevel = 'medium';
  } else {
    // This covers cases where completedPeriodsCount is 2 or 3.
    confidenceLevel = 'low';
  }

  return {
    predictedStartDate,
    averageCycleLength,
    confidenceLevel,
    hasSufficientData: true,
    cycleLengths,
    completedPeriodsCount,
  };
};
