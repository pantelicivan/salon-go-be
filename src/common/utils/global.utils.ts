/**
 * Checks is value empty, null or undefined.
 * If value is array, checks if the length of the array is greater than zero.
 * If values is an object, checks if the object has any key defined.
 * @param value - Value to be checked.
 * @returns Is value empty boolean.
 */
export const isEmpty = (value: any): boolean => {
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    value === 'null' ||
    value === 'undefined'
  ) {
    return true;
  }

  // Validate the length of array.
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  // Check if object has any key defined
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return true;
    return !objectHasAnyKey(value, keys);
  }

  return false;
};

/**
 * Checks if all values are empty, null or undefined.
 * If value is array, checks if the length of the array is greater than zero.
 * @param values - Values to be checked.
 * @returns Is value empty boolean.
 */
export const isAllEmpty = (values: any[]): boolean => {
  for (const value of values) {
    if (!isEmpty(value)) return false;
  }
  return true;
};

/**
 * Checks if value is not equal to undefined.
 * @param value - Value to be checked.
 * @returns Is value defined.
 */
export const isDefined = (value: any): boolean => {
  return value !== undefined;
};

/**
 * Checks if value is defined and not equal to null.
 * @param value - Value to be checked.
 * @returns Is value defined and not null.
 */
export const isNotNull = (value: any): boolean => {
  return value !== undefined && value !== null;
};

/**
 * Determines if the given object has at least one of the given keys defined.
 * @param object - Object to evaluate.
 * @param keys - Object keys array.
 * @returns Object has at least one key defined.
 */
export const objectHasAnyKey = (
  object: Record<string, any>,
  keys: string[],
): boolean => {
  if (keys.length === 0) return true;

  for (const key of keys) {
    if (isDefined(object[key])) return true;
  }

  return false;
};

/**
 * Returns a new object containing only keys that are not undefined.
 * @param object - Object to evaluate.
 * @returns New object with defined keys.
 */
export const filterUndefinedKeys = (
  object: Record<string, any>,
): Record<string, any> => {
  if (isEmpty(object)) return {};
  const filteredObject = {};

  for (const key of Object.keys(object)) {
    if (isDefined(object[key])) filteredObject[key] = object[key];
  }

  return filteredObject;
};

/**
 * Returns value if it is not empty, or backup value if it's empty.
 * @param value - Original value.
 * @param backup - Backup value to be returned if original value is empty.
 * @returns Value, or backup if value is empty.
 */
export const valueOrBackup = (value: any, backup: any): any => {
  if (!isEmpty(value)) return value;
  return backup;
};

/**
 * Checks if the given value is equal to any of the given values.
 * @param value - Value to evaluate.
 * @param values - Values for comparison.
 * @returns Boolean that indicates if value is equal to any of the given values.
 */
export const isEqualToAny = (value: any, values: any[]): boolean => {
  for (const valueForComparison of values) {
    if (value === valueForComparison) return true;
  }
  return false;
};

/**
 * Compares the two object looking for a difference in key values.
 * @param values - Object that should be compared to base object.
 * @param baseObject - Object of the comparison.
 * @returns Are key values different.
 */
export const isThereADifference = (
  values: Record<string, any>,
  baseObject: Record<string, any>,
): boolean => {
  const keys = Object.keys(values);
  for (const key of keys) {
    if (values[key] !== baseObject[key]) return true;
  }
  return false;
};

/**
 * Allows you to put Node to sleep for the selected amount of time.
 * @param milliseconds - Sleep time.
 * @returns Promise to await.
 */
export const sleep = async (milliseconds: number): Promise<unknown> => {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};
