import type { Cycle } from '@/modules/cycles/types';
import { isSameDay } from '@/utils/datetime';

// Props for the CalendarView component
interface CalendarViewProps {
  /** The date that determines which month and year to display. */
  displayDate: Date;
  /** An array of cycles to be marked on the calendar. */
  cycles: Array<Cycle>;
  /** Callback to handle changing the displayed month. */
  onMonthChange: (newDate: Date) => void;
  /** Optional class name to apply to the container. */
  className?: string;
}

// Static array for the days of the week header.
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * A UI component that displays a monthly calendar view. It highlights the
 * current day and any days that are part of a menstrual cycle.
 * Includes controls for navigating between months.
 */
export function CalendarView({
  displayDate,
  cycles = [],
  onMonthChange,
  className,
}: CalendarViewProps) {
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth(); // 0-indexed (January is 0)

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create a set of date strings for efficient lookup of period days.
  // This logic now iterates through date ranges for each cycle.
  const periodDays = new Set<string>();
  cycles.forEach((cycle) => {
    const startDate = new Date(cycle.startDate);
    // If the cycle is ongoing (no end date), highlight up to today.
    // Otherwise, use the specified end date.
    const endDate = cycle.endDate ? new Date(cycle.endDate) : today;

    // Use a for loop to iterate through the date range. This is a cleaner
    // pattern for this task and avoids potential linter issues with `while` loops.
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      periodDays.add(d.toDateString());
    }
  });

  // --- Calendar Grid Logic ---
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Determine the day of the week the month starts on (0 for Sunday, 6 for Saturday)
  const startDayOfWeek = firstDayOfMonth.getDay();

  // Create an array representing the calendar grid.
  // It includes `null` values for padding days from the previous month.
  const calendarGrid: Array<number | null> = [
    ...Array(startDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const handlePrevMonth = () => {
    onMonthChange(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(new Date(year, month + 1, 1));
  };

  return (
    <div className={`card w-full max-w-md bg-base-100 shadow-xl ${className}`}>
      <div className="card-body">
        {/* Header with month navigation */}
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
          {/* Weekday headers */}
          {WEEK_DAYS.map((day) => (
            <div key={day} className="text-sm font-bold text-base-content/60">
              {day}
            </div>
          ))}

          {/* Day cells */}
          {calendarGrid.map((day, index) => {
            if (day === null) {
              // Render blank divs for padding days
              return <div key={`blank-${index}`} className="h-10 w-10"></div>;
            }

            const currentDate = new Date(year, month, day);
            const isTodayFlag = isSameDay(currentDate, today);
            const isPeriodDayFlag = periodDays.has(currentDate.toDateString());

            // Build class names conditionally for styling
            let dayClasses =
              'grid h-10 w-10 place-content-center rounded-full transition-colors';
            if (isTodayFlag) {
              dayClasses += ' bg-primary text-primary-content';
            }
            if (isPeriodDayFlag && !isTodayFlag) {
              dayClasses += ' bg-red-200 text-red-800';
            }
            // Add a distinct style if the day is both today and a period day
            if (isPeriodDayFlag && isTodayFlag) {
              dayClasses +=
                ' bg-primary ring-2 ring-red-300 ring-offset-1 ring-offset-base-100';
            }

            return (
              <div key={day} className={dayClasses}>
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
