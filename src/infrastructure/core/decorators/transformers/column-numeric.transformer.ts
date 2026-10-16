/**
 * Ensures that entity's numeric column is actually a number.
 */
export class ColumnNumericTransformer {
  to(data: number): number {
    return data;
  }

  from(data: string): number {
    return parseFloat(data);
  }
}
