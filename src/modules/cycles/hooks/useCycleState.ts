import { useMemo } from 'react';
import type { CycleLog } from '@/modules/cycles/types';
import { isSameDay } from '@/utils/datetime';


/**
 * A hook that processes an array of cycle logs to determine the current
 * state of the user's menstrual cycle based on the `isEnded` flag.
 *
 * This hook is memoized with `useMemo` for performance, so it will only
 * re-calculate the state when the input `cycleLogs` array changes.
 *
 * @param cycleLogs An array of all cycle log entries from the database. Can be `undefined` during initial load.
 * @returns An object containing the derived state:
 *  - `isPeriodActive`: True if the most recent cycle log is not marked as ended.
 *  - `isPeriodToday`: True if an *active* (not ended) period log exists specifically for today.
 *  - `todayLog`: The active cycle log object for today, or `undefined` if none exists.
 */
export function useCycleState(cycleLogs: Array<CycleLog> | undefined) {
  const state = useMemo(() => {
    // Return a default, "not active" state if the data is not loaded or empty.
    if (!cycleLogs || cycleLogs.length === 0) {
      return {
        isPeriodActive: false,
        isPeriodToday: false,
        todayLog: undefined,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize for consistent comparisons

    // Find the log for today that is explicitly NOT ended.
    // This is the crucial fix. It correctly handles the case where a user ends
    // a period and then starts a new one on the same day by ignoring
    // the log that is already marked `isEnded: true`.
    const todayLog = cycleLogs.find(
      (log) => isSameDay(new Date(log.date), today) && !log.isEnded,
    );

    // To determine if a period is "active" overall, we find the most recent log.
    const sortedLogs = cycleLogs.toSorted(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    const mostRecentLog = sortedLogs[0];

    // An overall period is considered "active" if the most recent log exists and
    // its `isEnded` flag is false.
    const isPeriodActive = !mostRecentLog.isEnded;

    // A period is considered active *for today* if we found an active log for today.
    const isPeriodToday = !!todayLog;

    return {
      isPeriodActive,
      isPeriodToday,
      todayLog,
    };
  }, [cycleLogs]);

  return state;
}
