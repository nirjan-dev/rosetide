import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { hc } from 'hono/client'
import type { AppType } from '@periodos/backend/routes'
import { env } from '@/env'

export const Route = createFileRoute('/')({
  component: App,
})

const BASE_API = env.VITE_API_BASE

const client = hc<AppType>(BASE_API)

function App() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })

  async function getUsers() {
    try {
      const response = await client.api.v1.users.$get()
      const { users } = await response.json()
      return users
    }
    catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="text-center">
      <h1>
        Periodos app
      </h1>

      {isLoading
        ? <div>Loading...</div>
        : (
            <div>
              {data?.length}
              {' '}
              users
            </div>
          )}

      {data?.map(user => (
        <div key={user.id}>
          <h2>{user.name}</h2>
        </div>
      ))}
    </div>
  )
}
