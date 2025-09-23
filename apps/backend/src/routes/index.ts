import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getEnv } from '../env.js'
import usersRoute from './users.js'
const app = new Hono().basePath('/api/v1').use('*', cors({
  origin: (_origin, c) => {
    const { FRONTEND_URL } = getEnv(c)
    return FRONTEND_URL
  },
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
})).route('/users', usersRoute)

export type AppType = typeof app
export default app
