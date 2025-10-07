// Utility functions for period calculations
export interface CycleInfo {
  cycleLength: number | null // Days between start of this period and start of previous period
  periodDuration: number | null // Days from start to end of period (inclusive)
}

/**
 * Calculate cycle information for a period
 * @param period The period to calculate information for
 * @param previousPeriod The previous period (if available)
 * @returns Cycle information including cycle length and period duration
 */
export function calculateCycleInfo(
  period: { startDate: Date, endDate: Date | null },
  previousPeriod?: { startDate: Date },
): CycleInfo {
  // Calculate period duration if endDate exists
  let periodDuration: number | null = null
  if (period.endDate) {
    // Calculate inclusive days between start and end dates
    const start = new Date(period.startDate)
    const end = new Date(period.endDate)
    // Reset time part to compare only dates
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    // Calculate difference in days
    const diffTime = Math.abs(end.getTime() - start.getTime())
    periodDuration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 for inclusive
  }

  // Calculate cycle length if previous period exists
  let cycleLength: number | null = null
  if (previousPeriod) {
    const currentStart = new Date(period.startDate)
    const previousStart = new Date(previousPeriod.startDate)
    // Reset time part to compare only dates
    currentStart.setHours(0, 0, 0, 0)
    previousStart.setHours(0, 0, 0, 0)
    // Calculate difference in days
    const diffTime = Math.abs(currentStart.getTime() - previousStart.getTime())
    cycleLength = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return {
    cycleLength,
    periodDuration,
  }
}

/**
 * Calculate average cycle length from a list of periods
 * @param periods Array of periods ordered by startDate (newest first)
 * @returns Average cycle length or null if not enough data
 */
export function calculateAverageCycleLength(periods: { startDate: Date }[]): number | null {
  if (periods.length < 2) {
    return null
  }

  const cycleLengths: number[] = []

  // Calculate cycle lengths between consecutive periods
  for (let i = 0; i < periods.length - 1; i++) {
    const currentPeriod = periods[i]
    const previousPeriod = periods[i + 1]

    const currentStart = new Date(currentPeriod.startDate)
    const previousStart = new Date(previousPeriod.startDate)

    // Reset time part to compare only dates
    currentStart.setHours(0, 0, 0, 0)
    previousStart.setHours(0, 0, 0, 0)

    // Calculate difference in days
    const diffTime = Math.abs(currentStart.getTime() - previousStart.getTime())
    const cycleLength = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    cycleLengths.push(cycleLength)
  }

  if (cycleLengths.length === 0) {
    return null
  }

  // Calculate average
  const sum = cycleLengths.reduce((acc, val) => acc + val, 0)
  return Math.round(sum / cycleLengths.length)
}
