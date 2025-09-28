import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { getDB } from '../lib/db/index.js'
import { user as usersTable } from '../lib/db/schema.js'

const usersRoute = new Hono().get('/', async (c) => {
  const db = getDB(c)
  const users = await db.select().from(usersTable).all()
  return c.json({
    users,
  }, 200)
}).get('/:id', async (c) => {
  const id = c.req.param('id')
  const db = getDB(c)
  const user = await db.select().from(usersTable).where(eq(usersTable.id, id))
  return c.json({
    user,
  }, 200)
})

export default usersRoute
