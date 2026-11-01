import { differenceInDays, format, isValid } from "date-fns";
import { useRef, useState } from "react";
import { useDeletePeriod } from "../hooks/useDeletePeriod";
import { useAllPeriods } from "@/modules/periods/hooks/usePeriodLogs";

export const PeriodHistoryList = () => {
  // Live query: reflects every change (logging, imports, recovered records) without a reload.
  const periods = useAllPeriods();
  const deletePeriod = useDeletePeriod();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);

  const openDeleteModal = (id: number) => {
    setSelectedPeriodId(id);
    modalRef.current?.showModal();
  };

  const handleDelete = () => {
    if (selectedPeriodId) {
      deletePeriod.mutate(selectedPeriodId, {
        onSuccess: () => {
          modalRef.current?.close();
          setSelectedPeriodId(null);
        },
      });
    }
  };

  if (periods === undefined) {
    return (
      <div className="flex justify-center items-center p-8">
        <span className="loading loading-lg" />
      </div>
    );
  }

  if (periods.length === 0) {
    return (
      <div className="text-center p-8 bg-base-200 rounded-lg">
        <p className="opacity-70">You haven't logged any periods yet.</p>
        <p className="text-sm opacity-50 mt-2">
          Please start a new period or add a past one.
        </p>
      </div>
    );
  }

  return (
    <>
      <dialog ref={modalRef} id="delete_period_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Deletion</h3>
          <p className="py-4">
            Are you sure you want to delete this period? This action will
            also remove all associated daily logs and cannot be undone.
          </p>
          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={() => modalRef.current?.close()}
              disabled={deletePeriod.isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`btn btn-error ${deletePeriod.isPending ? "btn-disabled" : ""}`}
              onClick={handleDelete}
              disabled={deletePeriod.isPending}
            >
              {deletePeriod.isPending && (
                <span className="loading loading-spinner" />
              )}
              Delete
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="button" onClick={() => setSelectedPeriodId(null)}>
            close
          </button>
        </form>
      </dialog>
      <div className="overflow-x-auto">
        <table className="table table-zebra">
          {/* head */}
          <thead>
            <tr>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Duration</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {periods.map(period => {
              const isOngoing = !period.endDate || !isValid(period.endDate);
              const duration =
                !isOngoing && period.endDate
                  ? differenceInDays(period.endDate, period.startDate) + 1
                  : differenceInDays(new Date(), period.startDate) + 1;

              return (
                <tr key={period.id}>
                  <td>{format(period.startDate, "MMMM d, yyyy")}</td>
                  <td>
                    {!isOngoing && period.endDate
                      ? format(period.endDate, "MMMM d, yyyy")
                      : "Ongoing"}
                  </td>
                  <td>
                    <span className="badge badge-ghost">
                      {duration}&nbsp;day{duration === 1 ? "" : "s"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => period.id && openDeleteModal(period.id)}
                      disabled={!period.id}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};
