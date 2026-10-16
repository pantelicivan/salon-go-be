export type SuccessObject<T extends string> = {
  /**
   * Success code.
   */
  code: T;

  /**
   * Success description message. This can be treated as a fallback message if the translation fails.
   */
  message: string;
};

/**
 * A type that every SuccessObject is assignable to.
 */
export type SuccessLike = SuccessObject<string>;
