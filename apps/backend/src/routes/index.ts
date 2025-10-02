import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getEnv } from '@/env.js'
import { auth } from '@/lib/auth.js'
import { logger } from '@/middleware/logger.js'
import periodTrackerRoute from '@/modules/period-tracker/routes.js'
import usersRoute from '@/routes/users.js'
import type { AppVariables } from '@/types/hono.types.js'

const app = new Hono<{ Variables: AppVariables }>()
  .use(logger())
  .use('*', cors({
    origin: (_origin, c) => {
      const { FRONTEND_URL } = getEnv(c)
      return FRONTEND_URL
    },
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  }))
  .use('*', async (c, next) => {
    const session = await auth(c).api.getSession({ headers: c.req.raw.headers })
    if (!session) {
      c.set('user', null)
      c.set('session', null)
      return next()
    }
    c.set('user', session.user)
    c.set('session', session.session)
    return next()
  })

  .on(['POST', 'GET'], '/api/auth/*', c => auth(c).handler(c.req.raw))
  .basePath('/api/v1')
  .route('/users', usersRoute)
  .route('/periods', periodTrackerRoute)

export type AppType = typeof app
export default app
