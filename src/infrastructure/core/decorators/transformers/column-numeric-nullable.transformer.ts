/**
 * Ensures that entity's numeric column is actually a number.
 */
export class ColumnNullableNumericTransformer {
  to(data: number | null): number | null {
    return data;
  }

  from(data: string | null): number | null {
    if (data === null) {
      return data;
    }
    return parseFloat(data);
  }
}
