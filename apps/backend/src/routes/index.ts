import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getEnv } from '../env.js'
import { auth } from '../lib/auth.js'
import usersRoute from './users.js'
const app = new Hono().use('*', cors({
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
  .on(['POST', 'GET'], '/api/auth/*', c => auth(c).handler(c.req.raw))
  .basePath('/api/v1')
  .route('/users', usersRoute)

export type AppType = typeof app
export default app
