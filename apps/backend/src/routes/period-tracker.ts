import { Hono } from 'hono'
import { auth } from '../lib/auth.js'
import { getDB } from '../lib/db/index.js'
import {
  createPeriod,
  updatePeriod,
  getActivePeriod,
  getPeriods,
} from '../lib/db/queries.js'
import { calculateCycleInfo, calculateAverageCycleLength } from '../lib/period-calculations.js'
import type { AppVariables } from '../types/hono.types.js'

const periodTrackerRoute = new Hono <{ Variables: AppVariables }>().post('/', async (c) => {
  const authUser = c.get('user')
  if (!authUser?.id) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const db = getDB(c)

    // Check if user already has an active period
    const activePeriod = await getActivePeriod(db, authUser.id)
    if (activePeriod) {
      return c.json({ error: 'User already has an active period' }, 400)
    }

    // Create new period
    const newPeriod = await createPeriod(db, {
      userId: authUser.id,
      startDate: new Date(),
    })

    return c.json({
      success: true,
      period: newPeriod,
    }, 201)
  }
  catch (error) {
    console.error('Error creating period:', error)
    return c.json({ error: 'Failed to create period' }, 500)
  }
}).put('/end', async (c) => {
  const authUser = c.get('user')
  if (!authUser?.id) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const db = getDB(c)

    // Get active period
    const activePeriod = await getActivePeriod(db, authUser.id)
    if (!activePeriod) {
      return c.json({ error: 'No active period found' }, 400)
    }

    // End the period
    const updatedPeriod = await updatePeriod(db, activePeriod.id, {
      endDate: new Date(),
    })

    return c.json({
      success: true,
      period: updatedPeriod,
    }, 200)
  }
  catch (error) {
    console.error('Error ending period:', error)
    return c.json({ error: 'Failed to end period' }, 500)
  }
}).get('/', async (c) => {
  const authUser = c.get('user')
  if (!authUser?.id) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const db = getDB(c)
    const periods = await getPeriods(db, authUser.id)

    // Calculate cycle information for each period
    const periodsWithInfo = periods.map((period, index) => {
      const previousPeriod = index < periods.length - 1 ? periods[index + 1] : undefined
      const cycleInfo = calculateCycleInfo(period, previousPeriod)
      return {
        ...period,
        cycleInfo,
      }
    })

    // Calculate average cycle length
    const averageCycleLength = calculateAverageCycleLength(periods)

    return c.json({
      success: true,
      periods: periodsWithInfo,
      averageCycleLength,
    }, 200)
  }
  catch (error) {
    console.error('Error fetching periods:', error)
    return c.json({ error: 'Failed to fetch periods' }, 500)
  }
}).get('/active', async (c) => {
  const authUser = c.get('user')
  if (!authUser?.id) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const db = getDB(c)
    const activePeriod = await getActivePeriod(db, authUser.id)

    // Calculate cycle information for active period
    let periodWithInfo = null
    if (activePeriod) {
      // Get the most recent previous period to calculate cycle info
      const periods = await getPeriods(db, authUser.id)
      const previousPeriod = periods.find(p =>
        p.id !== activePeriod.id
        && new Date(p.startDate) < new Date(activePeriod.startDate),
      )

      const cycleInfo = calculateCycleInfo(activePeriod, previousPeriod)
      periodWithInfo = {
        ...activePeriod,
        cycleInfo,
      }
    }

    return c.json({
      success: true,
      period: periodWithInfo,
    }, 200)
  }
  catch (error) {
    console.error('Error fetching active period:', error)
    return c.json({ error: 'Failed to fetch active period' }, 500)
  }
})

export default periodTrackerRoute
