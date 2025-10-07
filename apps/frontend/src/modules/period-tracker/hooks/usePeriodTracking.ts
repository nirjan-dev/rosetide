import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { InferResponseType } from 'hono/client'
import { periodsClient } from '@/lib/hono-client'

// Define types based on Hono client return types
type PeriodsResponse = InferResponseType<typeof periodsClient.$get, 200>
type PeriodResponse = InferResponseType<typeof periodsClient.active.$get, 200>
type StartPeriodResponse = InferResponseType<typeof periodsClient.$post, 201>
type EndPeriodResponse = InferResponseType<typeof periodsClient.end.$put, 200>

// Custom hook for period tracking
export const usePeriodTracking = () => {
  const queryClient = useQueryClient()

  // Fetch user's period history
  const {
    data: periodsData,
    isLoading: isLoadingPeriods,
    isError: isErrorPeriods,
    error: periodsError,
  } = useQuery<PeriodsResponse, Error>({
    queryKey: ['periods'],
    queryFn: async () => {
      const res = await periodsClient.$get()
      if (!res.ok) {
        throw new Error('Failed to fetch periods')
      }
      return res.json()
    },
  })

  // Fetch active period
  const {
    data: activePeriodData,
    isLoading: isLoadingActivePeriod,
    isError: isErrorActivePeriod,
    error: activePeriodError,
  } = useQuery<PeriodResponse, Error>({
    queryKey: ['activePeriod'],
    queryFn: async () => {
      const res = await periodsClient.active.$get()
      if (!res.ok) {
        throw new Error('Failed to fetch active period')
      }
      return res.json()
    },
  })

  // Start a new period
  const startPeriodMutation = useMutation<StartPeriodResponse, Error>({
    mutationFn: async () => {
      const res = await periodsClient.$post()
      if (!res.ok) {
        throw new Error('Failed to start period')
      }
      return res.json()
    },
    onSuccess: () => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['periods'] })
      queryClient.invalidateQueries({ queryKey: ['activePeriod'] })
    },
  })

  // End current period
  const endPeriodMutation = useMutation<EndPeriodResponse, Error>({
    mutationFn: async () => {
      const res = await periodsClient.end.$put()
      if (!res.ok) {
        throw new Error('Failed to end period')
      }
      return res.json()
    },
    onSuccess: () => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['periods'] })
      queryClient.invalidateQueries({ queryKey: ['activePeriod'] })
    },
  })

  return {
    // Period data
    periods: periodsData?.periods || [],
    activePeriod: activePeriodData?.period,
    averageCycleLength: periodsData?.averageCycleLength || null,

    // Loading states
    isLoadingPeriods,
    isLoadingActivePeriod,
    isLoading: isLoadingPeriods || isLoadingActivePeriod || startPeriodMutation.isPending || endPeriodMutation.isPending,

    // Error states
    isErrorPeriods,
    isErrorActivePeriod,
    isError: isErrorPeriods || isErrorActivePeriod || startPeriodMutation.isError || endPeriodMutation.isError,
    error: periodsError || activePeriodError || startPeriodMutation.error || endPeriodMutation.error,

    // Mutations
    startPeriod: startPeriodMutation.mutate,
    endPeriod: endPeriodMutation.mutate,
    isStartingPeriod: startPeriodMutation.isPending,
    isEndingPeriod: endPeriodMutation.isPending,
  }
}
