import { z } from 'zod';

export const cycleLogSchema = z.object({
  id: z.number().optional(), // Dexie handles auto-incrementing
  date: z.date(),
  type: z.literal('periodDay'),
  flowIntensity: z.number().min(1).max(5),
  /**
   * If true, this log entry marks the last day of a period cycle.
   * This helps differentiate between an ongoing period and a finished one.
   * Defaults to false.
   */
  isEnded: z.boolean().optional().default(false),
});

export type CycleLog = z.infer<typeof cycleLogSchema>;
