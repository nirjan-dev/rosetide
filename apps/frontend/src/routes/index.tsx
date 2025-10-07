import { createFileRoute } from '@tanstack/react-router'
import React from 'react'
import type { User } from 'better-auth'
import { authClient } from '@/lib/auth-client'
import { PeriodTracker } from '@/modules/period-tracker'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [user, setUser] = React.useState<null | User>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    authClient.getSession().then((session) => {
      setUser(session.data?.user ?? null)
      setIsLoading(false)
    })
  }, [])

  async function handleSignIn() {
    const { data: loginData, error } = await authClient.signIn.social({
      provider: 'google',
      callbackURL: window.location.href,
    })

    console.log({ loginData, error })
  }

  async function handleSignOut() {
    await authClient.signOut()
    setUser(null)
  }

  const buttonToShow = user
    ? (
        <button className="btn" onClick={handleSignOut}>Logout</button>
      )
    : (
        <button onClick={handleSignIn} className="btn bg-white text-black border-[#e5e5e5]">
          <svg aria-label="Google logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <g>
              <path d="m0 0H512V512H0" fill="#fff"></path>
              <path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path>
              <path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path>
              <path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path>
              <path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path>
            </g>
          </svg>
          Login with Google
        </button>
      )

  if (isLoading) {
    return (
      <div className="text-center py-6 grid gap-4 container mx-auto">
        <h1 className="font-bold text-3xl">
          Periodos app
        </h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center py-6 grid gap-4 container mx-auto">
      <h1 className="font-bold text-3xl">
        Periodos app
      </h1>

      <div>
        {buttonToShow}
      </div>

      {user && (
        <div className="mt-8">
          <PeriodTracker />
        </div>
      )}
    </div>
  )
}
