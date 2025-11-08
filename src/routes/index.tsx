import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { PeriodLoggingCard } from '@/modules/periods/components/PeriodLoggingCard';
import { CalendarView } from '@/modules/periods/components/CalendarView';
import { LogPastPeriodModal } from '@/modules/periods/components/LogPastPeriodModal';
import { PeriodHistoryList } from '@/modules/periods/components/PeriodHistoryList';
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

export const Route = createFileRoute('/')({
  component: HomePage,
});


function HomePage() {
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
          <a
            role="tab"
            className={`tab ${activeView === 'calendar' ? 'tab-active' : ''}`}
            onClick={() => setActiveView('calendar')}
            onKeyDown={e => e.key === 'Enter' && setActiveView('calendar')}
          >
            Calendar
          </a>
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
            periods={allPeriods}
            onMonthChange={setCalendarDate}
          />
        ) : (
          <PeriodHistoryList />
        )}
      </div>
    </main>
  );
}
