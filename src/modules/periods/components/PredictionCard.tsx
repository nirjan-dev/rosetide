import { format, formatDistanceToNow } from 'date-fns';
import { usePredictionAnalytics } from '@/modules/periods/hooks/usePredictionAnalytics';
import { LogPastPeriodModal } from '@/modules/periods/components/LogPastPeriodModal';


const PredictionCardSkeleton = () => (
  <div className="card bg-base-100 shadow-xl">
    <div className="card-body items-center text-center">
      <div className="skeleton h-4 w-3/4"></div>
      <div className="skeleton my-2 h-10 w-1/2"></div>
      <div className="skeleton h-4 w-1/3"></div>
      <div className="divider my-4"></div>
      <div className="flex w-full justify-around">
        <div className="skeleton h-4 w-1/4"></div>
        <div className="skeleton h-4 w-1/4"></div>
      </div>
    </div>
  </div>
);


const InsufficientDataCard = () => (
  <div className="card border border-dashed bg-base-100 text-center shadow">
    <div className="card-body">
      <h2 className="card-title justify-center text-lg font-semibold">
        Ready for Your First Prediction?
      </h2>
      <p className="mt-2 text-base-content/80">
        Log at least two full periods to see your next period prediction.
      </p>
      <div className="card-actions mt-4 justify-center">
        <button
          className="btn btn-primary"
          onClick={() => {
            const modal = document.getElementById(
              'log_past_period_modal',
            ) as HTMLDialogElement | null;
            modal?.showModal();
          }}
        >
          Log a Past Period
        </button>
      </div>
    </div>
  </div>
);


export const PredictionCard = () => {
  const {
    predictedStartDate,
    averageCycleLength,
    confidenceLevel,
    hasSufficientData,
    isLoading,
  } = usePredictionAnalytics();

  if (isLoading) {
    return <PredictionCardSkeleton />;
  }

  // The `LogPastPeriodModal` must be rendered in the component tree for the
  // `InsufficientDataCard` button to be able to open it via its ID.
  return (
    <>
      {!hasSufficientData ? (
        <InsufficientDataCard />
      ) : (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <p className="text-base-content/70">
              Your next period is predicted around...
            </p>

            {predictedStartDate && (
              <>
                <h2 className="card-title my-2 text-4xl font-bold">
                  {format(predictedStartDate, 'MMMM do')}
                </h2>
                <p className="text-lg text-base-content/80">
                  ({formatDistanceToNow(predictedStartDate, { addSuffix: true })})
                </p>
              </>
            )}

            <div className="divider my-4"></div>

            <div className="flex w-full justify-around text-sm text-base-content/70">
              <span>Avg. Cycle: {averageCycleLength} days</span>
              <span className="first-letter:uppercase">
                Confidence: {confidenceLevel}
              </span>
            </div>
          </div>
        </div>
      )}
      <LogPastPeriodModal />
    </>
  );
};
