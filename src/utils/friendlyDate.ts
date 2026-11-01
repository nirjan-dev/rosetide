import { format, isToday, isYesterday } from 'date-fns';

/** "today", "yesterday", or "Apr 14, 2026". */
export function friendlyDate(date: Date): string {
  if (isToday(date)) return 'today';
  if (isYesterday(date)) return 'yesterday';
  return format(date, 'MMM d, yyyy');
}
