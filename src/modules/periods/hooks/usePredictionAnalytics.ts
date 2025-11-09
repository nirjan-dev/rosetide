import { useMemo } from 'react';
import { useAllPeriods } from './usePeriodLogs';
import type { PredictionAnalytics } from '@/modules/periods/utils';
import { calculatePeriodAnalytics } from '@/modules/periods/utils';

export interface UsePredictionAnalyticsResult extends PredictionAnalytics {
  isLoading: boolean;
  error: Error | null;
}

export const usePredictionAnalytics = (): UsePredictionAnalyticsResult => {
  const periods = useAllPeriods();

  const isLoading = periods === undefined;

  // Memoize the analytics calculation to avoid re-computing on every render.
  // The calculation only re-runs if the `periods` data changes.
  const analytics = useMemo((): PredictionAnalytics => {
    // If there's no data yet, return a default empty state.
    if (!periods) {
      return {
        predictedStartDate: null,
        averageCycleLength: null,
        confidenceLevel: null,
        hasSufficientData: false,
        cycleLengths: [],
        completedPeriodsCount: 0,
      };
    }

    // The calculation function requires periods to be sorted in ascending order (oldest first).
    // We create a new sorted array to avoid mutating the original `useLiveQuery` result.
    const sortedPeriods = [...periods].sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime(),
    );

    return calculatePeriodAnalytics(sortedPeriods);
  }, [periods]);

  return {
    ...analytics,
    isLoading,
    error: null, // `useLiveQuery` from Dexie.js does not expose an error state.
  };
};
