import { useRef } from "react";
import { LogPastPeriodForm } from "@/modules/cycles/components/LogPastPeriodForm";

/**
 * A component that provides a button to open a modal for logging a past period.
 * It contains the trigger button and the modal dialog itself.
 */
export const LogPastPeriodModal = () => {
  const modalRef = useRef<HTMLDialogElement>(null);

  const closeModal = () => {
    modalRef.current?.close();
  };

  const openModal = () => {
    modalRef.current?.showModal();
  };

  return (
    <>
      <button className="btn btn-primary" onClick={openModal}>
        Log a Past Period
      </button>

      <dialog ref={modalRef} id="log_past_period_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Log a Past Period</h3>
          <p className="py-4 text-sm opacity-80">
            Select the start and end dates for a past period cycle. This will
            help improve the accuracy of your future predictions.
          </p>

          <LogPastPeriodForm onSuccess={closeModal} onCancel={closeModal} />
        </div>
        <form method="dialog" className="modal-backdrop">
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};
