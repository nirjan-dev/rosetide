/**
 * A simple utility to check if two Date objects refer to the same calendar day.
 *
 * @param date1 The first date.
 * @param date2 The second date.
 * @returns True if they are the same day, false otherwise.
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};
