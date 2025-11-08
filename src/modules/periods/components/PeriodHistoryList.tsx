import { useQuery } from "@tanstack/react-query";
import { differenceInDays, format, isValid } from "date-fns";
import { useRef, useState } from "react";
import { useDeletePeriod } from "../hooks/useDeletePeriod";
import { db } from "@/lib/db";

export const usePeriods = () => {
  return useQuery({
    queryKey: ["periods"],
    queryFn: async () => {
      const periods = await db.periods.orderBy("startDate").reverse().toArray();
      return periods;
    },
  });
};


export const PeriodHistoryList = () => {
  const { data: periods, isLoading, isError, error } = usePeriods();
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <span className="loading loading-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div role="alert" className="alert alert-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Error loading period history: {error.message}</span>
      </div>
    );
  }

  if (!periods || periods.length === 0) {
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
