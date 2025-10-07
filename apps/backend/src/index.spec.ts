import { describe, it, expect } from 'vitest'
import app from '@/routes/index.js'

describe('Basic Server Test', () => {
  it('should return 404 for a non-existent route', async () => {
    const res = await app.request('/non-existent-route')
    expect(res.status).toBe(404)
  })
})
