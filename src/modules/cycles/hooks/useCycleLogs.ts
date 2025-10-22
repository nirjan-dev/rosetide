import { useLiveQuery } from 'dexie-react-hooks';
import { useMutation } from '@tanstack/react-query';
import type { Cycle, PeriodDay } from '@/modules/cycles/types';
import { db } from '@/lib/db';
import { cycleSchema, periodDaySchema } from '@/modules/cycles/types';

// --- Query Hooks ---

/**
 * Provides a reactive, real-time list of all period cycles, sorted by start date descending.
 * @returns An array of all cycle objects, or `undefined` during initial load.
 */
export function useAllCycles() {
  return useLiveQuery(
    () => db.cycles.orderBy('startDate').reverse().toArray(),
    [],
  );
}

/**
 * Provides the currently active period cycle (i.e., the one with no endDate).
 * @returns The active cycle object, or `undefined` if none is active or during load.
 */
export function useActiveCycle() {
  return useLiveQuery(
    () => db.cycles.filter((cycle) => !cycle.endDate).first(),
    [],
  );
}

/**
 * Provides a reactive list of all daily logs for a specific cycle.
 * @param cycleId The ID of the cycle to fetch logs for. Can be undefined.
 * @returns An array of PeriodDay objects, or `undefined` during load.
 */
export function usePeriodDays(cycleId: number | undefined) {
  return useLiveQuery((): Promise<Array<PeriodDay>> => {
    if (typeof cycleId !== 'number') {
      return Promise.resolve([]);
    }
    return db.periodDays.where('cycleId').equals(cycleId).sortBy('date');
  }, [cycleId]);
}

// --- Mutation Hooks ---

/**
 * A mutation to start a new period cycle.
 * It creates a new cycle record and the first daily log in a single transaction.
 */
export function useStartPeriod() {
  return useMutation({
    mutationFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to the start of the day

      const validatedCycle = cycleSchema
        .omit({ id: true })
        .parse({ startDate: today });

      return await db.transaction('rw', db.cycles, db.periodDays, async () => {
        // 1. Create the new cycle
        const newCycleId = await db.cycles.add(validatedCycle as Cycle);

        // 2. Create the first period day log for today
        const validatedDay = periodDaySchema.omit({ id: true }).parse({
          cycleId: newCycleId,
          date: today,
          flowIntensity: 1, // Default flow
        });
        await db.periodDays.add(validatedDay as PeriodDay);

        return newCycleId;
      });
    },
  });
}

/**
 * A mutation to end the currently active period cycle.
 * It sets the `endDate` of the specified cycle to the current date.
 */
export function useEndPeriod() {
  return useMutation({
    mutationFn: async (activeCycleId: number) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to the start of the day

      return await db.cycles.update(activeCycleId, { endDate: today });
    },
  });
}

/**
 * A mutation to update a daily period log.
 * Typically used to change the flow intensity for a given day.
 */
export function useUpdatePeriodDay() {
  return useMutation({
    mutationFn: async (dayLog: Partial<PeriodDay> & { id: number }) => {
      const { id, ...data } = dayLog;
      const validatedData = periodDaySchema.partial().parse(data);
      return await db.periodDays.update(id, validatedData);
    },
  });
}

/**
 * A mutation to add a new daily log to an active cycle.
 * This is used to automatically log a new day when the app is opened during an active period.
 */
export function useAddPeriodDay() {
  return useMutation({
    mutationFn: async (newDay: Omit<PeriodDay, 'id'>) => {
      const validatedDay = periodDaySchema.omit({ id: true }).parse(newDay);
      return await db.periodDays.add(validatedDay as PeriodDay);
    },
  });
}

/**
 * A mutation to cancel/delete a period cycle.
 * It removes the cycle and all its associated daily logs in a transaction.
 */
export function useCancelPeriod() {
  return useMutation({
    mutationFn: async (cycleId: number) => {
      return await db.transaction('rw', db.cycles, db.periodDays, async () => {
        await db.periodDays.where('cycleId').equals(cycleId).delete();
        await db.cycles.delete(cycleId);
      });
    },
  });
}
