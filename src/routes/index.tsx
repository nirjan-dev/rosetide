import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { PeriodLoggingCard } from '@/modules/cycles/components/PeriodLoggingCard';
import { CalendarView } from '@/modules/cycles/components/CalendarView';
import {
  useAddCycleLog,
  useCycleLogs,
  useDeleteCycleLog,
  useUpdateCycleLog,
} from '@/modules/cycles/hooks/useCycleLogs';
import { useCycleState } from '@/modules/cycles/hooks/useCycleState';

export const Route = createFileRoute('/')({
  component: HomePage,
});

/**
 * The main home page for the application.
 *
 * This component orchestrates the data flow and state management for the
 * primary user-facing features: logging period days and viewing the cycle
 * history on a calendar. It uses `useLiveQuery` for reactive data fetching.
 */
function HomePage() {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const today = new Date();

  // --- Data Fetching & State ---
  const cycleLogs = useCycleLogs();
  const { isPeriodActive, todayLog } = useCycleState(cycleLogs);

  // --- Mutations ---
  const addCycleLog = useAddCycleLog();
  const updateCycleLog = useUpdateCycleLog();
  const deleteCycleLog = useDeleteCycleLog();
  const isMutating =
    addCycleLog.isPending ||
    updateCycleLog.isPending ||
    deleteCycleLog.isPending;

  // --- Event Handlers ---

  /**
   * Creates a new period log for the current day.
   */
  const handleStartPeriod = () => {
    addCycleLog.mutate({
      date: today,
      type: 'periodDay',
      flowIntensity: 1, // Default flow
      isEnded: false, // Explicitly mark as ongoing
    });
  };

  /**
   * Marks today's period log as the end of the cycle.
   */
  const handleEndPeriod = () => {
    if (todayLog?.id) {
      updateCycleLog.mutate({ id: todayLog.id, isEnded: true });
    }
  };

  /**
   * Deletes today's period log, effectively canceling it.
   */
  const handleCancelPeriod = () => {
    if (todayLog?.id) {
      deleteCycleLog.mutate(todayLog.id);
    }
  };

  /**
   * Updates the flow intensity for today's log entry.
   */
  const handleFlowChange = (newIntensity: number) => {
    if (todayLog?.id) {
      updateCycleLog.mutate({ id: todayLog.id, flowIntensity: newIntensity });
    }
  };

  // --- Render Logic ---

  if (cycleLogs === undefined) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 flex flex-col items-center gap-8">
      <PeriodLoggingCard
        currentDate={today}
        isPeriodActive={isPeriodActive}
        flowIntensity={todayLog?.flowIntensity ?? 1}
        onStartPeriod={handleStartPeriod}
        onEndPeriod={handleEndPeriod}
        onCancelPeriod={handleCancelPeriod}
        onFlowChange={handleFlowChange}
        isLoading={isMutating}
      />
      <CalendarView
        displayDate={calendarDate}
        cycleLogs={cycleLogs}
        onMonthChange={setCalendarDate}
      />
    </main>
  );
}
