/**
 * @param min - Min int number
 * @param max - Max int number
 * @return Random integer between min and max, min and max are included.
 */
export const getRandomInteger = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * @param min - Min float number
 * @param max - Max float number
 * @param digits - Number of digits, default 2
 * @return Random float between min and max, min included and max are excluded.
 */
export const getRandomNumber = (
  min: number,
  max: number,
  digits = 2,
): number => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(digits));
};

/**
 * @param array
 * @return Random element of array
 */
export const getRandomArrayElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * @param array
 * @param amount - Length of subarray
 * @returns Randomised subarray of given length
 */
export const getRandomArrayElements = <T>(array: T[], amount: number): T[] => {
  return shuffleArray(array).slice(-amount);
};

/**
 * Shuffles array
 * @param array
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
