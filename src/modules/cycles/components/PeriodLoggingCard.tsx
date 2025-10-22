import { FlowIntensitySlider } from '@/modules/cycles/components/FlowIntensitySlider';

interface PeriodLoggingCardProps {
  /** The current date to be displayed on the card. */
  currentDate: Date;
  /** True if there is an ongoing period cycle. */
  isPeriodActive: boolean;
  /** The current flow intensity for today (1-5). Defaults to 1. */
  flowIntensity: number;
  /** Callback fired when the "Start Period" button is clicked. */
  onStartPeriod: () => void;
  /** Callback fired when the "End Period" button is clicked, marking the cycle as complete. */
  onEndPeriod: () => void;
  /** Callback fired when the "Cancel Period" button is clicked, deleting the cycle. */
  onCancelPeriod: () => void;
  /** Callback fired when the flow intensity value changes. */
  onFlowChange: (newIntensity: number) => void;
  /** If true, all interactive elements will be disabled. */
  isLoading?: boolean;
  /** If true, the user is allowed to cancel the period (e.g., only on the same day it started). */
  canCancel?: boolean;
}

/**
 * A UI card component that serves as the primary control for logging
 * the start and end of a menstrual period and tracking daily flow intensity.
 * It provides explicit actions for starting, ending, and canceling a period.
 */
export function PeriodLoggingCard({
  currentDate,
  isPeriodActive,
  flowIntensity,
  onStartPeriod,
  onEndPeriod,
  onCancelPeriod,
  onFlowChange,
  isLoading = false,
  canCancel = false,
}: PeriodLoggingCardProps) {
  const formattedDate = currentDate.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="card w-full max-w-md bg-base-100 shadow-xl">
      <div className="card-body items-center text-center">
        <h2 className="card-title text-2xl">Hello!</h2>
        <p className="mb-4 text-base-content/80">{formattedDate}</p>

        <div className="card-actions justify-center w-full">
          {isPeriodActive ? (
            // --- Active Period State ---
            // When a period is active, show options to end or cancel it.
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <button
                className="btn btn-primary flex-grow"
                onClick={onEndPeriod}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  'End Period'
                )}
              </button>
              {canCancel && (
                <button
                  className="btn btn-ghost flex-grow"
                  onClick={onCancelPeriod}
                  disabled={isLoading}
                >
                  Cancel Period
                </button>
              )}
            </div>
          ) : (
            // --- Default State ---
            // If no period is active, show the start button.
            <button
              className="btn btn-primary btn-wide"
              onClick={onStartPeriod}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                'Start Period'
              )}
            </button>
          )}
        </div>

        {/* The Flow Intensity Slider is only shown if a period is active */}
        {isPeriodActive && (
          <FlowIntensitySlider
            value={flowIntensity}
            onChange={onFlowChange}
            disabled={isLoading}
          />
        )}
      </div>
    </div>
  );
}
