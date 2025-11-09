import { useMemo } from 'react';
import { Info } from 'lucide-react';
import type { Period } from '@/modules/periods/types';
import { useFertilityPrediction } from '@/modules/periods/hooks/useFertilityPrediction';
import { isSameDay } from '@/utils/datetime';

interface CalendarViewProps {
  displayDate: Date;
  periods: Array<Period>;
  onMonthChange: (newDate: Date) => void;
  className?: string;
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarView({
  displayDate,
  periods = [],
  onMonthChange,
  className,
}: CalendarViewProps) {
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prediction = useFertilityPrediction();

  // Memoize lookup sets for performance.
  // These will only be recalculated when the underlying data changes.
  const { periodDays, fertileDays, ovulationDay } = useMemo(() => {
    const periodDaysSet = new Set<string>();
    periods.forEach(period => {
      const startDate = new Date(period.startDate);
      const endDate = period.endDate ? new Date(period.endDate) : today;
      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        periodDaysSet.add(d.toDateString());
      }
    });

    const fertileDaysSet = new Set<string>();
    let _ovulationDay: string | null = null;

    if (prediction.hasSufficientData && prediction.fertileWindowStartDate) {
      const { fertileWindowStartDate, fertileWindowEndDate, ovulationDate } =
        prediction;
      // The end of the fertile window is the ovulation day
      const end = fertileWindowEndDate ?? today;
      for (
        let d = new Date(fertileWindowStartDate);
        d <= end;
        d.setDate(d.getDate() + 1)
      ) {
        fertileDaysSet.add(d.toDateString());
      }
      if (ovulationDate) {
        _ovulationDay = new Date(ovulationDate).toDateString();
      }
    }

    return { periodDays: periodDaysSet, fertileDays: fertileDaysSet, ovulationDay: _ovulationDay };
  }, [periods, prediction, today]);

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = firstDayOfMonth.getDay();

  const calendarGrid: Array<number | null> = [
    ...Array(startDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const handlePrevMonth = () => onMonthChange(new Date(year, month - 1, 1));
  const handleNextMonth = () => onMonthChange(new Date(year, month + 1, 1));

  return (
    <div className={`card w-full max-w-md bg-base-100 shadow-xl ${className}`}>
      <div className="card-body">
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <button
            className="btn btn-ghost btn-circle"
            onClick={handlePrevMonth}
            aria-label="Previous month"
          >
            ❮
          </button>
          <h2 className="card-title text-xl">
            {displayDate.toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </h2>
          <button
            className="btn btn-ghost btn-circle"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            ❯
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 text-center">
          {WEEK_DAYS.map(day => (
            <div key={day} className="text-sm font-bold text-base-content/60">
              {day}
            </div>
          ))}

          {calendarGrid.map((day, index) => {
            if (day === null) {
              return <div key={`blank-${index}`} className="w-full aspect-square"></div>;
            }

            const currentDate = new Date(year, month, day);
            const currentDateStr = currentDate.toDateString();
            const isTodayFlag = isSameDay(currentDate, today);
            const isPeriodDayFlag = periodDays.has(currentDateStr);
            const isFertileDayFlag = fertileDays.has(currentDateStr);
            const isOvulationDayFlag = ovulationDay === currentDateStr;

            let dayClasses =
              'grid w-full aspect-square place-content-center rounded-full transition-colors';
            let ringClasses = '';

            // Apply styles with a clear priority
            if (isFertileDayFlag)
              dayClasses += ' bg-green-200 text-green-800';
            if (isOvulationDayFlag)
              dayClasses =
                'grid w-full aspect-square place-content-center rounded-full font-bold transition-colors bg-green-300 text-green-900';
            if (isPeriodDayFlag)
              dayClasses =
                'grid w-full aspect-square place-content-center rounded-full transition-colors bg-red-200 text-red-800';

            if (isTodayFlag) {
              dayClasses =
                'grid w-full aspect-square place-content-center rounded-full transition-colors bg-primary text-primary-content';
              if (isPeriodDayFlag) ringClasses = ' ring-2 ring-red-300';
              else if (isOvulationDayFlag)
                ringClasses = ' ring-2 ring-green-400';
              else if (isFertileDayFlag)
                ringClasses = ' ring-2 ring-green-200';
              if (ringClasses)
                ringClasses += ' ring-offset-1 ring-offset-base-100';
              dayClasses += ringClasses;
            }

            return (
              <div key={day} className={dayClasses}>
                {day}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 space-y-2 pt-4 border-t border-base-200">
          <div className="flex items-center text-sm">
            <span className="w-4 h-4 rounded-full bg-red-200 mr-2"></span>
            <span>Period Day</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="w-4 h-4 rounded-full bg-green-200 mr-2"></span>
            <span>Fertile Window</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="w-4 h-4 rounded-full bg-green-300 mr-2"></span>
            <span>Est. Ovulation Day</span>
          </div>
          {!prediction.hasSufficientData && !prediction.isLoading && (
            <div
              className="tooltip tooltip-bottom w-full mt-2"
              data-tip="The app needs at least two complete cycles to start making predictions."
            >
              <div className="flex items-center text-xs text-warning justify-center p-1 bg-warning/10 rounded-md">
                <Info size={14} className="mr-1 flex-shrink-0" />
                <span>Insufficient data for predictions.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
