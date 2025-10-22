import { z } from 'zod';

// Schema for a period cycle, representing the start and end of a period.
export const cycleSchema = z.object({
  id: z.number().optional(), // Dexie handles auto-incrementing
  startDate: z.date(),
  endDate: z.date().optional(), // An ongoing period will not have an end date.
});

export type Cycle = z.infer<typeof cycleSchema>;

// Schema for a single day's log within a period cycle.
export const periodDaySchema = z.object({
  id: z.number().optional(), // Dexie handles auto-incrementing
  cycleId: z.number(), // Foreign key to the Cycle table
  date: z.date(),
  flowIntensity: z.number().min(1).max(5),
});

export type PeriodDay = z.infer<typeof periodDaySchema>;
