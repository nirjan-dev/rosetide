import type { User } from 'better-auth/types'

export interface AppVariables {
  user: User & { id: string }
}
