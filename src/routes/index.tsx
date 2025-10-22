import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { PeriodLoggingCard } from '@/modules/cycles/components/PeriodLoggingCard';
import { CalendarView } from '@/modules/cycles/components/CalendarView';
import {
  useAllCycles,
  useCancelPeriod,
  useEndPeriod,
  useStartPeriod,
  useUpdatePeriodDay,
} from '@/modules/cycles/hooks/useCycleLogs';
import {
  useAutomaticDailyLogging,
  useCycleState,
} from '@/modules/cycles/hooks/useCycleState';
import { isSameDay } from '@/utils/datetime';

export const Route = createFileRoute('/')({
  component: HomePage,
});

/**
 * The main home page for the application.
 *
 * This component orchestrates the data flow and state management for the
 * primary user-facing features: logging period cycles and viewing the
 * history on a calendar.
 */
function HomePage() {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const today = new Date();

  // --- Data Fetching & State ---
  const allCycles = useAllCycles();
  const { activeCycle, isPeriodActive, todayLog } = useCycleState();

  // This hook handles creating a new log for today if a period is active
  useAutomaticDailyLogging();

  // --- Mutations ---
  const startPeriod = useStartPeriod();
  const endPeriod = useEndPeriod();
  const cancelPeriod = useCancelPeriod();
  const updatePeriodDay = useUpdatePeriodDay();

  const isMutating =
    startPeriod.isPending ||
    endPeriod.isPending ||
    cancelPeriod.isPending ||
    updatePeriodDay.isPending;

  // --- Event Handlers ---

  /**
   * Starts a new period cycle.
   */
  const handleStartPeriod = () => {
    startPeriod.mutate();
  };

  /**
   * Ends the current active period cycle.
   */
  const handleEndPeriod = () => {
    // Check for existence of activeCycle and its id before mutating.
    if (activeCycle?.id) {
      endPeriod.mutate(activeCycle.id);
    }
  };

  /**
   * Cancels the active period, but only if it was started today.
   */
  const handleCancelPeriod = () => {
    // Check for existence of activeCycle and its id before mutating.
    if (activeCycle?.id) {
      cancelPeriod.mutate(activeCycle.id);
    }
  };

  /**
   * Updates the flow intensity for today's log entry.
   */
  const handleFlowChange = (newIntensity: number) => {
    // Check for existence of todayLog and its id before mutating.
    if (todayLog?.id) {
      updatePeriodDay.mutate({ id: todayLog.id, flowIntensity: newIntensity });
    }
  };

  // --- Render Logic ---

  if (allCycles === undefined) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // A period can only be cancelled on the same day it was started.
  const canCancelPeriod =
    activeCycle ? isSameDay(activeCycle.startDate, today) : false;

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
        canCancel={canCancelPeriod}
      />
      <CalendarView
        displayDate={calendarDate}
        cycles={allCycles}
        onMonthChange={setCalendarDate}
      />
    </main>
  );
}
