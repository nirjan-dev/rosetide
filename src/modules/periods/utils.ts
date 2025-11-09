import type { Period } from '@/modules/periods/types';
import { addDays, differenceInDays } from '@/utils/datetime';


export interface PredictionAnalytics {
  predictedStartDate: Date | null;
  averageCycleLength: number | null;
  confidenceLevel: 'low' | 'medium' | 'high' | null;
  hasSufficientData: boolean;
  cycleLengths: Array<number>;
  completedPeriodsCount: number;
}

export interface FertilityPrediction {
  fertileWindowStartDate: Date | null;
  fertileWindowEndDate: Date | null;
  ovulationDate: Date | null;
  hasSufficientData: boolean;
  status: 'predicting' | 'insufficient_data';
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

/**
 * Calculates the fertile window and ovulation day based on period analytics.
 * The standard calculation assumes ovulation occurs ~14 days before the next period.
 * The fertile window is the 5 days before ovulation plus ovulation day.
 *
 * @param periods - An array of `Period` objects, sorted by `startDate` in ascending order.
 * @returns An object containing the fertility prediction data.
 */
export const calculateFertilityWindow = (
  periods: Array<Period>,
): FertilityPrediction => {
  const analytics = calculatePeriodAnalytics(periods);

  if (!analytics.hasSufficientData || !analytics.predictedStartDate) {
    return {
      fertileWindowStartDate: null,
      fertileWindowEndDate: null,
      ovulationDate: null,
      hasSufficientData: false,
      status: 'insufficient_data',
    };
  }

  // Ovulation is typically 14 days before the start of the next period.
  const ovulationDate = addDays(analytics.predictedStartDate, -14);
  // The fertile window starts 5 days before ovulation.
  const fertileWindowStartDate = addDays(ovulationDate, -5);
  // The fertile window ends on the day of ovulation.
  const fertileWindowEndDate = ovulationDate;

  return {
    fertileWindowStartDate,
    fertileWindowEndDate,
    ovulationDate,
    hasSufficientData: true,
    status: 'predicting',
  };
};
