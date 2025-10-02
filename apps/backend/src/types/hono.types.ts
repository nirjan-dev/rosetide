import type { Session, User } from 'better-auth'

export interface AppVariables {
  user: User | null
  session: Session | null
}

export interface AuthGuardAppVariables extends AppVariables
{
  user: User
}
