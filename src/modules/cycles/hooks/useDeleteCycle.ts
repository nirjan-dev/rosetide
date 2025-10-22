import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/db";

/**
 * A custom hook that provides a mutation function to delete a cycle record and its associated day logs.
 * It handles invalidation of the 'cycles' query to ensure the UI is updated on success.
 *
 * @returns A TanStack Query mutation object for deleting a cycle.
 */
export const useDeleteCycle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cycleId: number) => {
      // Use a transaction to ensure both deletions succeed or fail together
      return db.transaction("rw", db.cycles, db.periodDays, async () => {
        // Delete all period day logs associated with this cycle
        await db.periodDays.where({ cycleId }).delete();
        // Delete the cycle itself
        return db.cycles.delete(cycleId);
      });
    },
    onSuccess: () => {
      // Invalidate and refetch the cycles query to update the history list and calendar
      return queryClient.invalidateQueries({ queryKey: ["cycles"] });
    },
    onError: error => {
      // TODO: Replace with a user-facing notification (e.g., a toast)
      console.error("Failed to delete cycle:", error);
    },
  });
};
