/* eslint-disable @typescript-eslint/unbound-method */
import type { User } from 'better-auth'
import type { Context, Next } from 'hono'
import { testClient } from 'hono/testing'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import app from '@/index.js'
import { PeriodTrackerService } from '@/modules/period-tracker/period-tracker.service.js'
import type { Period } from '@/modules/period-tracker/period-tracker.service.js'

// Mock the PeriodTrackerService to isolate route handlers from the database.
vi.mock('@/modules/period-tracker/period-tracker.service.js', () => ({
  PeriodTrackerService: {
    getActivePeriod: vi.fn(),
    createPeriod: vi.fn(),
    updatePeriod: vi.fn(),
    getPeriods: vi.fn(),
  },
}))

const testUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}
// Mock the authGuard middleware to simulate an authenticated user.
vi.mock('@/middleware/auth-guard.js', () => ({
  authGuard: vi.fn(async (c: Context, next: Next) => {
    c.set('user', testUser)
    await next()
  }),
}))

// Mock the database dependency to prevent any actual DB calls.
vi.mock('@/lib/db/index.js', () => ({
  getDB: vi.fn().mockReturnValue({}), // Return a dummy DB object
}))

describe('Period Tracker Routes', () => {
  const client = testClient(app)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('POST / - Create a new period', () => {
    it('[SUCCESS] Should create a new period for the authenticated user and return a 201 status code', async () => {
      // Arrange
      vi.mocked(PeriodTrackerService.getActivePeriod).mockResolvedValue(null)
      const newPeriod: Period = {
        id: 'period-1',
        userId: testUser.id,
        startDate: new Date(),
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      vi.mocked(PeriodTrackerService.createPeriod).mockResolvedValue(newPeriod)

      // Act
      const res = await client.api.v1.periods.$post()
      const json = await res.json()

      // Assert
      expect(res.status).toBe(201)
      if ('success' in json) {
        expect(json.period.id).toBe('period-1')
      }
      else {
        expect.fail('Expected a success response but received an error.')
      }
    })

    it('[INVALID] Should return a 400 status code if the user already has an active period', async () => {
      // Arrange
      const activePeriod: Period = {
        id: 'active-period-1',
        userId: testUser.id,
        startDate: new Date(),
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      vi.mocked(PeriodTrackerService.getActivePeriod).mockResolvedValue(activePeriod)

      // Act
      const res = await client.api.v1.periods.$post()
      const json = await res.json()

      // Assert
      expect(res.status).toBe(400)
      if ('error' in json) {
        expect(json.error).toBe('User already has an active period')
      }
      else {
        expect.fail('Expected an error response but received a success response.')
      }
    })

    it('[FAILURE] Should return a 500 status code if period creation fails', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(PeriodTrackerService.getActivePeriod).mockResolvedValue(null)
      vi.mocked(PeriodTrackerService.createPeriod).mockRejectedValue(new Error('DB error'))

      // Act
      const res = await client.api.v1.periods.$post()
      const json = await res.json()

      // Assert
      expect(res.status).toBe(500)
      if ('error' in json) {
        expect(json.error).toBe('Failed to create period')
      }
      else {
        expect.fail('Expected an error response but received a success response.')
      }
      consoleErrorSpy.mockRestore()
    })
  })

  describe('PUT /end - End an active period', () => {
    it('[SUCCESS] Should end an active period and return a 200 status code', async () => {
      // Arrange
      const activePeriod: Period = {
        id: 'period-1',
        userId: testUser.id,
        startDate: new Date(),
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const endedPeriod: Period = { ...activePeriod, endDate: new Date() }
      vi.mocked(PeriodTrackerService.getActivePeriod).mockResolvedValue(activePeriod)
      vi.mocked(PeriodTrackerService.updatePeriod).mockResolvedValue(endedPeriod)

      // Act
      const res = await client.api.v1.periods.end.$put()
      const json = await res.json()

      // Assert
      expect(res.status).toBe(200)
      if ('success' in json) {
        expect(json.period.id).toBe('period-1')
        expect(json.period.endDate).not.toBe(null)
      }
      else {
        expect.fail('Expected a success response but received an error.')
      }
    })

    it('[INVALID] Should return a 400 status code if there is no active period', async () => {
      // Arrange
      vi.mocked(PeriodTrackerService.getActivePeriod).mockResolvedValue(null)

      // Act
      const res = await client.api.v1.periods.end.$put()
      const json = await res.json()

      // Assert
      expect(res.status).toBe(400)
      if ('error' in json) {
        expect(json.error).toBe('No active period found')
      }
      else {
        expect.fail('Expected an error response but received a success response.')
      }
    })

    it('[FAILURE] Should return a 500 status code if ending period fails', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const activePeriod: Period = {
        id: 'period-1',
        userId: testUser.id,
        startDate: new Date(),
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      vi.mocked(PeriodTrackerService.getActivePeriod).mockResolvedValue(activePeriod)
      vi.mocked(PeriodTrackerService.updatePeriod).mockRejectedValue(new Error('DB error'))

      // Act
      const res = await client.api.v1.periods.end.$put()
      const json = await res.json()

      // Assert
      expect(res.status).toBe(500)
      if ('error' in json) {
        expect(json.error).toBe('Failed to end period')
      }
      else {
        expect.fail('Expected an error response but received a success response.')
      }
      consoleErrorSpy.mockRestore()
    })
  })

  describe('GET / - Get all periods', () => {
    it('[SUCCESS] Should return all periods for the user with cycle info', async () => {
      // Arrange
      const periods: Period[] = [
        { id: 'period-2', userId: testUser.id, startDate: new Date('2023-02-01'), endDate: new Date('2023-02-05'), createdAt: new Date(), updatedAt: new Date() },
        { id: 'period-1', userId: testUser.id, startDate: new Date('2023-01-01'), endDate: new Date('2023-01-05'), createdAt: new Date(), updatedAt: new Date() },
      ]
      vi.mocked(PeriodTrackerService.getPeriods).mockResolvedValue(periods)

      // Act
      const res = await client.api.v1.periods.$get()
      const json = await res.json()

      // Assert
      expect(res.status).toBe(200)
      if ('success' in json) {
        expect(json.periods).toHaveLength(2)
        expect(json.periods[0].id).toBe('period-2')
        expect(json.periods[0]).toHaveProperty('cycleInfo')
        expect(json.periods[0].cycleInfo.cycleLength).toBe(31) // Feb 1 - Jan 1
        expect(json.averageCycleLength).toBe(31)
      }
      else {
        expect.fail('Expected a success response but received an error.')
      }
    })

    it('[SUCCESS] Should return an empty array if the user has no periods', async () => {
      // Arrange
      vi.mocked(PeriodTrackerService.getPeriods).mockResolvedValue([])

      // Act
      const res = await client.api.v1.periods.$get()
      const json = await res.json()

      // Assert
      expect(res.status).toBe(200)
      if ('success' in json) {
        expect(json.periods).toHaveLength(0)
      }
      else {
        expect.fail('Expected a success response but received an error.')
      }
    })

    it('[FAILURE] Should return a 500 status code if fetching periods fails', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(PeriodTrackerService.getPeriods).mockRejectedValue(new Error('DB error'))

      // Act
      const res = await client.api.v1.periods.$get()
      const json = await res.json()

      // Assert
      expect(res.status).toBe(500)
      if ('error' in json) {
        expect(json.error).toBe('Failed to fetch periods')
      }
      else {
        expect.fail('Expected an error response but received a success response.')
      }
      consoleErrorSpy.mockRestore()
    })
  })

  describe('GET /active - Get active period', () => {
    it('[SUCCESS] Should return the active period with cycle info', async () => {
      // Arrange
      const activePeriod: Period = { id: 'period-2', userId: testUser.id, startDate: new Date('2023-02-01'), endDate: null, createdAt: new Date(), updatedAt: new Date() }
      const allPeriods: Period[] = [
        activePeriod,
        { id: 'period-1', userId: testUser.id, startDate: new Date('2023-01-01'), endDate: new Date('2023-01-05'), createdAt: new Date(), updatedAt: new Date() },
      ]
      vi.mocked(PeriodTrackerService.getActivePeriod).mockResolvedValue(activePeriod)
      vi.mocked(PeriodTrackerService.getPeriods).mockResolvedValue(allPeriods)

      // Act
      const res = await client.api.v1.periods.active.$get()
      const json = await res.json()

      // Assert
      expect(res.status).toBe(200)
      if ('success' in json) {
        expect(json.period?.id).toBe('period-2')
        expect(json.period).toHaveProperty('cycleInfo')
        expect(json.period?.cycleInfo.cycleLength).toBe(31) // Cycle length from previous period
      }
      else {
        expect.fail('Expected a success response but received an error.')
      }
    })

    it('[SUCCESS] Should return null if there is no active period', async () => {
      // Arrange
      vi.mocked(PeriodTrackerService.getActivePeriod).mockResolvedValue(null)

      // Act
      const res = await client.api.v1.periods.active.$get()
      const json = await res.json()

      // Assert
      expect(res.status).toBe(200)
      if ('success' in json) {
        expect(json.period).toBe(null)
      }
      else {
        expect.fail('Expected a success response but received an error.')
      }
    })

    it('[FAILURE] Should return a 500 status code if fetching active period fails', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(PeriodTrackerService.getActivePeriod).mockRejectedValue(new Error('DB error'))

      // Act
      const res = await client.api.v1.periods.active.$get()
      const json = await res.json()

      // Assert
      expect(res.status).toBe(500)
      if ('error' in json) {
        expect(json.error).toBe('Failed to fetch active period')
      }
      else {
        expect.fail('Expected an error response but received a success response.')
      }
      consoleErrorSpy.mockRestore()
    })
  })
})
