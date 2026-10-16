/**
 * Calculate offset or skip for pagination
 * @param limit Page size
 * @param  page - Page number
 * @return - Offset number
 */
export const calculateOffset = (limit: number, page: number): number => {
  return (page - 1) * limit;
};
