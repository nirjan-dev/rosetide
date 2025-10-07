import { createMiddleware } from 'hono/factory'
import type { AppVariables } from '@/types/hono.types.js'

export const authGuard = createMiddleware<{
  Variables: AppVariables
}>(async (c, next) => {
  const authUser = c.get('user')
  if (!authUser?.id) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  await next()
})
