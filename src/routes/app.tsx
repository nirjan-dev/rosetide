import { Link, createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { DatabaseGate } from '@/components/DatabaseGate';
import { InstallBanner } from '@/components/InstallBanner';
import { SettingsModal } from '@/components/SettingsModal';
import { CalendarView } from '@/modules/periods/components/CalendarView';
import { FertilityCard } from '@/modules/periods/components/FertilityCard';
import { LogPastPeriodModal } from '@/modules/periods/components/LogPastPeriodModal';
import { PeriodHistoryList } from '@/modules/periods/components/PeriodHistoryList';
import { PeriodLoggingCard } from '@/modules/periods/components/PeriodLoggingCard';
import { PredictionCard } from '@/modules/periods/components/PredictionCard';
import {
  useAllPeriods,
  useCancelPeriod,
  useEndPeriod,
  useStartPeriod,
  useUpdatePeriodDay,
} from '@/modules/periods/hooks/usePeriodLogs';
import {
  useAutomaticDailyLogging,
  usePeriodState,
} from '@/modules/periods/hooks/usePeriodState';
import { isSameDay } from '@/utils/datetime';

export const Route = createFileRoute('/app')({
  component: TrackerPage,
  head: () => ({
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  }),
});

function TrackerPage() {
  return (
    <DatabaseGate>
      <TrackerContent />
    </DatabaseGate>
  );
}

function TrackerContent() {
  const [activeView, setActiveView] = useState<'calendar' | 'list'>('calendar');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const today = new Date();

  const allPeriods = useAllPeriods();
  const { activePeriod, isPeriodActive, todayLog } = usePeriodState();

  // This hook handles creating a new log for today if a period is active
  useAutomaticDailyLogging();

  const startPeriod = useStartPeriod();
  const endPeriod = useEndPeriod();
  const cancelPeriod = useCancelPeriod();
  const updatePeriodDay = useUpdatePeriodDay();

  const isMutating =
    startPeriod.isPending ||
    endPeriod.isPending ||
    cancelPeriod.isPending ||
    updatePeriodDay.isPending;

  const handleStartPeriod = () => {
    startPeriod.mutate();
  };

  const handleEndPeriod = () => {
    if (activePeriod?.id) {
      endPeriod.mutate(activePeriod.id);
    }
  };

  const handleCancelPeriod = () => {
    if (activePeriod?.id) {
      cancelPeriod.mutate(activePeriod.id);
    }
  };

  const handleFlowChange = (newIntensity: number) => {
    if (todayLog?.id) {
      updatePeriodDay.mutate({ id: todayLog.id, flowIntensity: newIntensity });
    }
  };

  if (allPeriods === undefined) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // A period can only be cancelled on the same day it was started.
  const canCancelPeriod =
    activePeriod ? isSameDay(activePeriod.startDate, today) : false;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 lg:py-8">
      <InstallBanner />
      <nav className="mb-6 flex items-center justify-between" aria-label="Tracker">
        <Link to="/" className="link link-hover text-sm">
          ← About Rosetide
        </Link>
        <span className="text-xs opacity-70">Records stay in this browser</span>
      </nav>
      <main className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-8">
        <div className="flex w-full flex-col gap-6">
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
          <div className="flex flex-col gap-3">
            <LogPastPeriodModal />
            <SettingsModal />
          </div>
          <PredictionCard />
          <FertilityCard />
        </div>

        <div className="w-full">
          <div role="tablist" aria-label="Period history views" className="tabs tabs-border mb-4">
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'calendar'}
              className={`tab ${activeView === 'calendar' ? 'tab-active' : ''}`}
              onClick={() => setActiveView('calendar')}
            >
              Calendar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'list'}
              className={`tab ${activeView === 'list' ? 'tab-active' : ''}`}
              onClick={() => setActiveView('list')}
            >
              History
            </button>
          </div>

          {activeView === 'calendar' ? (
            <CalendarView
              displayDate={calendarDate}
              periods={allPeriods}
              onMonthChange={setCalendarDate}
            />
          ) : (
            <PeriodHistoryList />
          )}
        </div>
      </main>
    </div>
  );
}
