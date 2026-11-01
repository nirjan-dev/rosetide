import { useMutation } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { createSafetyRestorePoint } from "@/lib/restorePoints";

export const useDeletePeriod = () => {
  return useMutation({
    mutationFn: async (periodId: number) => {
      await createSafetyRestorePoint("before-delete");
      return db.transaction("rw", db.periods, db.periodDays, async () => {
        await db.periodDays.where({ periodId }).delete();
        return db.periods.delete(periodId);
      });
    },
    onError: error => {
      // TODO: Replace with a user-facing notification (e.g., a toast)
      console.error("Failed to delete cycle:", error);
    },
  });
};
