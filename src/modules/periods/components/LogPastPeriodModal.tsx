import { useRef } from "react";
import { LogPastPeriodForm } from "@/modules/periods/components/LogPastPeriodForm";


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
      <button className="btn" onClick={openModal}>
        Log a Past Period
      </button>

      <dialog ref={modalRef} id="log_past_period_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Log a Past Period</h3>
          <p className="py-4 text-sm opacity-80">
            Select the start and end dates for a past period. This will
            help improve the accuracy of your future predictions.
          </p>

          <LogPastPeriodForm onSuccess={closeModal} onCancel={closeModal} />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};
