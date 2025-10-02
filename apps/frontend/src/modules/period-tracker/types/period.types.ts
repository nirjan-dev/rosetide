import type { usePeriodTracking } from '@/modules/period-tracker/hooks/usePeriodTracking'

export type Period = (ReturnType<typeof usePeriodTracking>)['periods'][0]
export type ActivePeriod = (ReturnType<typeof usePeriodTracking>)['activePeriod']
