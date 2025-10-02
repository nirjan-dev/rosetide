import type { Session, User } from 'better-auth'
import type { PinoLogger } from 'hono-pino'

export interface AppVariables {
  user: User | null
  session: Session | null
  logger: PinoLogger
}

export interface AuthGuardAppVariables extends AppVariables
{
  user: User
}
