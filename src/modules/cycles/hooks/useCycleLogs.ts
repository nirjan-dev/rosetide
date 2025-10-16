import { useLiveQuery } from 'dexie-react-hooks';
import { useMutation } from '@tanstack/react-query';
import type {CycleLog} from '@/modules/cycles/types';
import { db } from '@/lib/db';
import {  cycleLogSchema } from '@/modules/cycles/types';

/**
 * A factory for creating consistent query keys for cycle logs.
 * Although useLiveQuery removes the need for manual invalidation,
 * these keys can still be useful for direct cache manipulation if needed.
 */
export const cycleLogKeys = {
  all: ['cycleLogs'] as const,
  byDate: (date: string) => [...cycleLogKeys.all, 'date', date] as const,
};

/**
 * A Dexie React hook that provides a reactive, real-time list of all cycle logs.
 *
 * This hook uses `useLiveQuery` to subscribe directly to the Dexie database.
 * The component using this hook will automatically re-render whenever the
 * data in the 'cycles' table changes.
 *
 * @returns An array of all cycle logs, which is `undefined` during the initial loading state.
 */
export function useCycleLogs() {
  return useLiveQuery(() => db.cycles.toArray(), []);
}

/**
 * A TanStack Query mutation hook for adding a new cycle log entry.
 *
 * It validates the input against the Zod schema before insertion.
 * Data changes will be automatically reflected in components using `useCycleLogs`.
 *
 * @returns A mutation object for adding a cycle log.
 */
export function useAddCycleLog() {
  return useMutation({
    mutationFn: async (newLog: Omit<CycleLog, 'id'>) => {
      // Validate the data before writing to the database
      const validatedLog = cycleLogSchema.omit({ id: true }).parse(newLog);
      return await db.cycles.add(validatedLog as CycleLog);
    },
    // No onSuccess invalidation needed, useLiveQuery handles it automatically.
  });
}

/**
 * A TanStack Query mutation hook for updating an existing cycle log entry.
 *
 * Data changes will be automatically reflected in components using `useCycleLogs`.
 *
 * @returns A mutation object for updating a cycle log.
 */
export function useUpdateCycleLog() {
  return useMutation({
    mutationFn: async (logToUpdate: Partial<CycleLog> & { id: number }) => {
      const { id, ...data } = logToUpdate;
      // Validate the partial data before updating
      const validatedData = cycleLogSchema.partial().parse(data);
      return await db.cycles.update(id, validatedData);
    },
    // No onSuccess invalidation needed, useLiveQuery handles it automatically.
  });
}

/**
 * A TanStack Query mutation hook for deleting a cycle log entry.
 *
 * Data changes will be automatically reflected in components using `useCycleLogs`.
 *
 * @returns A mutation object for deleting a cycle log.
 */
export function useDeleteCycleLog() {
  return useMutation({
    mutationFn: (id: number) => {
      return db.cycles.delete(id);
    },
    // No onSuccess invalidation needed, useLiveQuery handles it automatically.
  });
}
