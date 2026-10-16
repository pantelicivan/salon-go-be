export type TContext = {
  priority?: number;
  translationKey?: string;
  args?: any;
};

export type TContexts = {
  [type: string]: TContext;
};

export type FieldError = {
  field: string;
  error: string;
};

/**
 * Errors formated in a single level of depth.
 * @example
 * ```json
 * {
 *   "errors": {
 *      "account.name": "Name should not be empty.",
 *      "account.location.longitude": "Longitude should not be empty"
 *   }
 * }
 * ```
 */
export type SingleLevelErrors = Record<string, string>;

export type HttpExceptionData = {
  // HTTP Status code.
  statusCode: number;
  // Moment of the exception.
  timestamp: Date;
  // Error code that can be used to further identify an error.
  errorCode?: string;
  // A single level error message.
  errorMessage?: string;
  // Nested error messages.
  errors?: FieldError[];
  // DTO that throw the error.
  targetDto?: string;
  // Additional details that can be passed.
  details?: string;
};
