import { hc } from 'hono/client'
import type { AppType } from '@periodos/backend/routes'
import { env } from '@/env'

// Get the backend URL from environment variables
const BACKEND_URL = env.VITE_API_BASE || 'http://localhost:3000'

// Create the Hono client
export const client = hc<AppType>(BACKEND_URL, {
  init: {
    credentials: 'include',
  },
})

// Export individual API clients for easier usage
export const usersClient = client.api.v1.users
export const periodsClient = client.api.v1.periods

export type { AppType }
