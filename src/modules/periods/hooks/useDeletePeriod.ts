import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/db";

export const useDeletePeriod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (periodId: number) => {
      return db.transaction("rw", db.periods, db.periodDays, async () => {
        await db.periodDays.where({ periodId }).delete();
        return db.periods.delete(periodId);
      });
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["periods"] });
    },
    onError: error => {
      // TODO: Replace with a user-facing notification (e.g., a toast)
      console.error("Failed to delete cycle:", error);
    },
  });
};
