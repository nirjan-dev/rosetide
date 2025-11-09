import { useMemo } from 'react';
import type { FertilityPrediction } from '@/modules/periods/utils';
import { useAllPeriods } from '@/modules/periods/hooks/usePeriodLogs';
import { calculateFertilityWindow } from '@/modules/periods/utils';

export interface UseFertilityPredictionResult extends FertilityPrediction {
  isLoading: boolean;
  error: Error | null;
}

export const useFertilityPrediction = (): UseFertilityPredictionResult => {
  const periods = useAllPeriods();

  const isLoading = periods === undefined;

  // Memoize the prediction calculation to avoid re-computing on every render.
  // The calculation only re-runs if the `periods` data changes.
  const prediction = useMemo((): FertilityPrediction => {
    // If there's no data yet, return a default empty state.
    if (!periods) {
      return {
        fertileWindowStartDate: null,
        fertileWindowEndDate: null,
        ovulationDate: null,
        hasSufficientData: false,
        status: 'insufficient_data',
      };
    }

    // The calculation function requires periods to be sorted in ascending order (oldest first).
    // We create a new sorted array to avoid mutating the original `useLiveQuery` result.
    const sortedPeriods = [...periods].sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime(),
    );

    return calculateFertilityWindow(sortedPeriods);
  }, [periods]);

  return {
    ...prediction,
    isLoading,
    error: null, // `useLiveQuery` from Dexie.js does not expose an error state.
  };
};
