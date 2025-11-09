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


const MS_PER_DAY = 1000 * 60 * 60 * 24;


/**
 * Adds a specified number of days to a date.
 * @param date The date to add days to.
 * @param amount The number of days to add.
 * @returns A new Date object with the days added.
 */
export function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

/**
 * Calculates the difference in full days between two dates, ignoring time and timezone.
 * @param dateLeft The later date.
 * @param dateRight The earlier date.
 * @returns The number of full days between the two dates.
 */
export function differenceInDays(dateLeft: Date, dateRight: Date): number {
  const utcLeft = Date.UTC(
    dateLeft.getFullYear(),
    dateLeft.getMonth(),
    dateLeft.getDate(),
  );
  const utcRight = Date.UTC(
    dateRight.getFullYear(),
    dateRight.getMonth(),
    dateRight.getDate(),
  );

  return Math.floor((utcLeft - utcRight) / MS_PER_DAY);
}
