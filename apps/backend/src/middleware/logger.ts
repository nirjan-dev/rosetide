import { pinoLogger } from 'hono-pino'
import { pino } from 'pino'

export function logger() {
  return pinoLogger({
    pino: pino({
      level: process.env.LOG_LEVEL ?? 'info',
      transport: process.env.NODE_ENV === 'production'
        ? undefined
        : {
            target: 'hono-pino/debug-log',
          },
    }),
    http: {
      reqId: () => crypto.randomUUID(),
    },
  })
}
