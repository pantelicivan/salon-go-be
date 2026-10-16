/**
 * Converts Megabytes to Bytes.
 * One Megabyte consists of 1048576 Bytes.
 * @param mb - MB value.
 * @returns Bytes value.
 */
export const convertMBtoB = (mb: number): number => {
  return mb * 1048576;
};
