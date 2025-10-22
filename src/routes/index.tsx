import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { PeriodLoggingCard } from '@/modules/cycles/components/PeriodLoggingCard';
import { CalendarView } from '@/modules/cycles/components/CalendarView';
import { LogPastPeriodModal } from '@/modules/cycles/components/LogPastPeriodModal';
import { PeriodHistoryList } from '@/modules/cycles/components/PeriodHistoryList';
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
  const [activeView, setActiveView] = useState<'calendar' | 'list'>('calendar');
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
    <main className="container max-w-lg mx-auto py-4 px-6 flex flex-col items-center gap-8">
      <div className="w-full max-w-md flex flex-col gap-8 center">
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
        <LogPastPeriodModal />
      </div>

      <div className="w-full max-w-2xl">
        <div role="tablist" className="tabs tabs-border mb-4">
          {/* biome-ignore lint/a11y/useAnchorContent: <explanation> */}
          <a
            role="tab"
            className={`tab ${activeView === 'calendar' ? 'tab-active' : ''}`}
            onClick={() => setActiveView('calendar')}
            onKeyDown={e => e.key === 'Enter' && setActiveView('calendar')}
          >
            Calendar
          </a>
          {/* biome-ignore lint/a11y/useAnchorContent: <explanation> */}
          <a
            role="tab"
            className={`tab ${activeView === 'list' ? 'tab-active' : ''}`}
            onClick={() => setActiveView('list')}
            onKeyDown={e => e.key === 'Enter' && setActiveView('list')}
          >
            History
          </a>
        </div>

        {activeView === 'calendar' ? (
          <CalendarView
            displayDate={calendarDate}
            cycles={allCycles}
            onMonthChange={setCalendarDate}
          />
        ) : (
          <PeriodHistoryList />
        )}
      </div>
    </main>
  );
}
