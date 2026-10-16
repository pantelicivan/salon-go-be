import { isEmpty } from './global.utils';

/**
 * Ensures that the passed string starts with the given start key.
 * Example: value = bstorm.co | key = https:// -> https://bstorm.co
 * @param value - String value to examine.
 * @param startKey - Required start key.
 * @returns A string that starts with the passed key.
 */
export const startStringWith = (value: string, startKey: string): string => {
  if (value.substring(0, startKey.length) === startKey) return value;
  return startKey + value;
};

/**
 * Capitalizes the given string;
 * @param value - String.
 * @returns Capitalized string.
 */
export const capitalizeString = (value: string): string => {
  if (isEmpty(value)) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
};
