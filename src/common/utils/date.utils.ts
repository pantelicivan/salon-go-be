import { addMinutes } from 'date-fns';

/**
 * Casts date to UTC date by adding the UTC minutes offset of the date.
 * @param date
 * @returns UTC Date.
 */
export const castToUTCDate = (date: Date): Date => {
  return addMinutes(date, date.getTimezoneOffset() * -1);
};

/**
 * Returns timestamp in seconds.
 * @param date - The given date.
 * @returns Timestamp in seconds.
 */
export const getTimestampInSeconds = (date: Date): number => {
  return date.getTime() / 1000;
};
