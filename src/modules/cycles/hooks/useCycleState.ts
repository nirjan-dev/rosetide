import { useEffect, useMemo } from 'react';

import {
  useActiveCycle,
  useAddPeriodDay,
  usePeriodDays,
} from './useCycleLogs';
import { isSameDay } from '@/utils/datetime';

/**
 * A hook that derives the current state of the user's menstrual cycle
 */
export function useCycleState() {
  const activeCycle = useActiveCycle();
  const periodDays = usePeriodDays(activeCycle?.id);

  const state = useMemo(() => {
    const isPeriodActive = !!activeCycle;

    // Default state when no period is active or data is loading
    if (!isPeriodActive || !periodDays) {
      return {
        activeCycle: undefined,
        isPeriodActive: false,
        todayLog: undefined,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize for consistent comparisons

    const todayLog = periodDays.find((log) =>
      isSameDay(new Date(log.date), today),
    );

    return {
      activeCycle,
      isPeriodActive,
      todayLog,
    };
  }, [activeCycle, periodDays]);

  return state;
}

/**
 * A side-effect hook to automatically create a new daily log if the app is opened
 * during an active period on a day that hasn't been logged yet.
 *
 * This keeps the state logic in `useCycleState` clean and separates the action
 * of logging from the derivation of state.
 */
export function useAutomaticDailyLogging() {
  const { activeCycle, todayLog } = useCycleState();
  const { mutate: addDay, isPending: isAddingDay } = useAddPeriodDay();

  useEffect(() => {
    // Conditions to trigger automatic logging:
    // 1. A period cycle is active and its data is loaded.
    // 2. There is no log for today yet.
    // 3. The mutation to add a day is not already in progress.
    if (activeCycle && !todayLog && !isAddingDay) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Defensive check: ensure the cycle ID exists. The linter indicates the
      // date check is redundant.
      if (activeCycle.id) {
        addDay({
          cycleId: activeCycle.id,
          date: today,
          flowIntensity: 1, // Default flow
        });
      }
    }
  }, [activeCycle, todayLog, addDay, isAddingDay]);
}
