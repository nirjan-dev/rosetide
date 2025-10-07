import { useState } from 'react'
import type { ActivePeriod, Period } from '@/modules/period-tracker/types/period.types'
import { usePeriodTracking } from '@/modules/period-tracker/hooks/usePeriodTracking'
import { PeriodButton } from '@/modules/period-tracker/components/PeriodButton'

export const PeriodTracker = () => {
  const {
    periods,
    activePeriod,
    averageCycleLength,
    isLoading,
    isError,
    error,
    startPeriod,
    endPeriod,
    isStartingPeriod,
    isEndingPeriod,
  } = usePeriodTracking()

  const [showAllPeriods, setShowAllPeriods] = useState(false)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="alert alert-error">
        <div>
          <span>
            Error:
            {error?.message || 'An error occurred'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Period Tracker</h1>
        <p className="text-gray-600">
          Track your menstrual cycle with ease
        </p>
      </div>

      {/* Period Button */}
      <div className="flex justify-center mb-8">
        <PeriodButton
          isActivePeriod={!!activePeriod}
          onStartPeriod={startPeriod}
          onEndPeriod={endPeriod}
          isStarting={isStartingPeriod}
          isEnding={isEndingPeriod}
        />
      </div>

      {/* Cycle Information */}
      {averageCycleLength && (
        <CycleOverview
          averageCycleLength={averageCycleLength}
          activePeriod={activePeriod}
        />
      )}

      {/* Period History */}
      <PeriodHistory
        periods={periods}
        showAllPeriods={showAllPeriods}
        setShowAllPeriods={setShowAllPeriods}
      />
    </div>
  )
}

const PeriodHistory = ({ periods, showAllPeriods, setShowAllPeriods }: PeriodHistoryProps) => {
  const displayedPeriods = showAllPeriods ? periods : periods.slice(0, 5)

  return (
    <div className="bg-base-100 rounded-box p-4 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-xl font-semibold mb-2 sm:mb-0">Period History</h2>
        {periods.length > 5 && (
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setShowAllPeriods(!showAllPeriods)}
          >
            {showAllPeriods ? 'Show Less' : 'Show All'}
          </button>
        )}
      </div>

      {periods.length === 0
        ? (
            <div className="text-center py-8 text-gray-500">
              <p>No period history yet. Start tracking your periods!</p>
            </div>
          )
        : (
            <div className="overflow-x-auto">
              <div className="hidden sm:block">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Duration</th>
                      <th>Cycle Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedPeriods.map((period: Period) => {
                      const startDate = new Date(period.startDate)
                      const endDate = period.endDate ? new Date(period.endDate) : null

                      let duration = 'Ongoing'
                      if (endDate) {
                        const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
                        duration = `${diffDays} day${diffDays !== 1 ? 's' : ''}`
                      }

                      return (
                        <tr key={period.id} className={period.endDate ? '' : 'active'}>
                          <td>{startDate.toLocaleDateString()}</td>
                          <td>
                            {endDate
                              ? endDate.toLocaleDateString()
                              : <span className="badge badge-primary">Active</span>}
                          </td>
                          <td>{duration}</td>
                          <td>
                            {period.cycleInfo.cycleLength
                              ? `${period.cycleInfo.cycleLength} days`
                              : 'N/A'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden">
                {displayedPeriods.map((period: Period) => {
                  const startDate = new Date(period.startDate)
                  const endDate = period.endDate ? new Date(period.endDate) : null

                  let duration = 'Ongoing'
                  if (endDate) {
                    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
                    duration = `${diffDays} day${diffDays !== 1 ? 's' : ''}`
                  }

                  return (
                    <div key={period.id} className="mb-4 p-4 border rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Start Date:</span>
                        <span>{startDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">End Date:</span>
                        <span>
                          {endDate
                            ? endDate.toLocaleDateString()
                            : <span className="badge badge-primary">Active</span>}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Duration:</span>
                        <span>{duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Cycle Length:</span>
                        <span>
                          {period.cycleInfo.cycleLength
                            ? `${period.cycleInfo.cycleLength} days`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
    </div>
  )
}

const CycleOverview = ({ averageCycleLength, activePeriod }: CycleOverviewProps) => {
  return (
    <div className="bg-base-100 rounded-box p-6 mb-8 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-center">Cycle Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div className="stat">
          <div className="stat-title">Average Cycle Length</div>
          <div className="stat-value text-primary">
            {averageCycleLength}
            {' '}
            days
          </div>
          <div className="stat-desc">Based on your period history</div>
        </div>
        {activePeriod && activePeriod.cycleInfo.cycleLength && (
          <div className="stat">
            <div className="stat-title">Current Cycle</div>
            <div className="stat-value text-secondary">
              {activePeriod.cycleInfo.cycleLength}
              {' '}
              days
            </div>
            <div className="stat-desc">Since last period</div>
          </div>
        )}
      </div>
    </div>
  )
}

interface PeriodHistoryProps {
  periods: Array<Period>
  showAllPeriods: boolean
  setShowAllPeriods: (show: boolean) => void
}

interface CycleOverviewProps {
  averageCycleLength: number | null
  activePeriod: ActivePeriod
}
