import 'dotenv/config'
import { serve } from '@hono/node-server'
import { runMigrations } from '@/lib/db/migrate.js'
import app from '@/routes/index.js'
try {
  await runMigrations()
  console.log('Migrations completed')
}
catch (error) {
  console.error('Error running migrations:', error)
}

serve({
  fetch: app.fetch,
  port: 3000,
}, (info) => {
  console.log(`Server is running on http://localhost:${String(info.port)}`)
})
