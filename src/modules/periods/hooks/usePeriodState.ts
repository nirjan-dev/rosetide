import { useEffect, useMemo } from 'react';

import {
  useActivePeriod,
  useAddPeriodDay,
  usePeriodDays,
} from '@/modules/periods/hooks/usePeriodLogs';
import { isSameDay } from '@/utils/datetime';

export function usePeriodState() {
  const activePeriod = useActivePeriod();
  const periodDays = usePeriodDays(activePeriod?.id);

  const state = useMemo(() => {
    const isPeriodActive = !!activePeriod;

    // Default state when no period is active or data is loading
    if (!isPeriodActive || !periodDays) {
      return {
        activePeriod: undefined,
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
      activePeriod,
      isPeriodActive,
      todayLog,
    };
  }, [activePeriod, periodDays]);

  return state;
}

export function useAutomaticDailyLogging() {
  const { activePeriod, todayLog } = usePeriodState();
  const { mutate: addDay, isPending: isAddingDay } = useAddPeriodDay();

  useEffect(() => {
    // Conditions to trigger automatic logging:
    // 1. A period cycle is active and its data is loaded.
    // 2. There is no log for today yet.
    // 3. The mutation to add a day is not already in progress.
    if (activePeriod && !todayLog && !isAddingDay) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (activePeriod.id) {
        addDay({
          periodId: activePeriod.id,
          date: today,
          flowIntensity: 1, // Default flow
        });
      }
    }
  }, [activePeriod, todayLog, addDay, isAddingDay]);
}
