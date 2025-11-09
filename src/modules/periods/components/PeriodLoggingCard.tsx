import { FlowIntensitySlider } from '@/modules/periods/components/FlowIntensitySlider';

interface PeriodLoggingCardProps {
  currentDate: Date;
  isPeriodActive: boolean;
  flowIntensity: number;
  onStartPeriod: () => void;
  onEndPeriod: () => void;
  onCancelPeriod: () => void;
  onFlowChange: (newIntensity: number) => void;
  isLoading?: boolean;
  canCancel?: boolean;
}

export function PeriodLoggingCard({
  isPeriodActive,
  flowIntensity,
  onStartPeriod,
  onEndPeriod,
  onCancelPeriod,
  onFlowChange,
  isLoading = false,
  canCancel = false,
}: PeriodLoggingCardProps) {


  return (
    <div className="card w-full max-w-md bg-base-100 shadow-xl">
      <div className="card-body items-center text-center">
        <h2 className="card-title text-2xl">Welcome to Rosetide</h2>
        <img src="/images/logo.svg" className="w-16 h-16" alt="rosetide logo" />
        <p className="mb-4 text-base-content/80">Track you period and fertility. No servers, 100% local secure tracking. Free Forever.</p>

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
