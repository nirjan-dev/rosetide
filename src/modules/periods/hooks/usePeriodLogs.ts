import { useLiveQuery } from 'dexie-react-hooks';
import { useMutation } from '@tanstack/react-query';
import type { Period, PeriodDay } from '@/modules/periods/types';
import { db } from '@/lib/db';
import { periodDaySchema, periodSchema } from '@/modules/periods/types';


export function useAllPeriods() {
  return useLiveQuery(
    () => db.periods.orderBy('startDate').reverse().toArray(),
    [],
  );
}

export function useActivePeriod() {
  return useLiveQuery(
    () => db.periods.filter((cycle) => !cycle.endDate).first(),
    [],
  );
}

export function usePeriodDays(periodId: number | undefined) {
  return useLiveQuery((): Promise<Array<PeriodDay>> => {
    if (typeof periodId !== 'number') {
      return Promise.resolve([]);
    }
    return db.periodDays.where('periodId').equals(periodId).sortBy('date');
  }, [periodId]);
}

export function useStartPeriod() {
  return useMutation({
    mutationFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to the start of the day

      const validatedPeriod = periodSchema
        .omit({ id: true })
        .parse({ startDate: today });

      return await db.transaction('rw', db.periods, db.periodDays, async () => {
        const newPeriodId = await db.periods.add(validatedPeriod as Period);

        const validatedDay = periodDaySchema.omit({ id: true }).parse({
          periodId: newPeriodId,
          date: today,
          flowIntensity: 1, // Default flow
        });
        await db.periodDays.add(validatedDay as PeriodDay);

        return newPeriodId;
      });
    },
  });
}

export function useEndPeriod() {
  return useMutation({
    mutationFn: async (activePeriodId: number) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to the start of the day

      return await db.periods.update(activePeriodId, { endDate: today });
    },
  });
}

export function useUpdatePeriodDay() {
  return useMutation({
    mutationFn: async (dayLog: Partial<PeriodDay> & { id: number }) => {
      const { id, ...data } = dayLog;
      const validatedData = periodDaySchema.partial().parse(data);
      return await db.periodDays.update(id, validatedData);
    },
  });
}

export function useAddPeriodDay() {
  return useMutation({
    mutationFn: async (newDay: Omit<PeriodDay, 'id'>) => {
      const validatedDay = periodDaySchema.omit({ id: true }).parse(newDay);
      return await db.periodDays.add(validatedDay as PeriodDay);
    },
  });
}

export function useCancelPeriod() {
  return useMutation({
    mutationFn: async (periodId: number) => {
      return await db.transaction('rw', db.periods, db.periodDays, async () => {
        await db.periodDays.where('cycleId').equals(periodId).delete();
        await db.periods.delete(periodId);
      });
    },
  });
}
