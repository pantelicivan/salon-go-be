import { ErrorObject } from './result';

/**
 * List of Core error codes.
 */
export const ErrorCode = {
  /**
   * Unknown error.
   */
  Unknown: 'Unknown',

  /**
   * Invalid argument value error.
   */
  InvalidArgument: 'InvalidArgument',

  /**
   * Operation not allowed error.
   */
  NotAllowed: 'NotAllowed',

  /**
   * Not implemented error
   *
   */
  NotImplemented: 'NotImplemented',
};

/**
 * Unknown error object.
 */
export type Unknown = ErrorObject<typeof ErrorCode.Unknown>;
export function Unknown(): Unknown {
  return {
    code: ErrorCode.Unknown,
    message: 'Unknown error.',
  };
}

/**
 * Invalid argument value error object.
 */
// prettier-ignore
export type InvalidArgument = ErrorObject<typeof ErrorCode.InvalidArgument, {
    /**
     * Name of the argument with invalid value.
     */
    argument: string;
    /**
     * Actual (invalid) argument value.
     */
    value: unknown;
    /**
     * Optional Joi validator identifier.
     */
    validator?: string;
}>;

/**
 * @param argument Name of the argument with invalid value.
 * @param value Actual (invalid) argument value.
 * @param validator Optional Joi validator identifier.
 */
export function InvalidArgument(
  argument: string,
  value: unknown,
  validator?: string,
): InvalidArgument {
  return {
    code: ErrorCode.InvalidArgument,
    message: 'Invalid argument value.',
    details: {
      argument,
      value,
      validator,
    },
  };
}

/**
 * Operation not allowed error object.
 */
// prettier-ignore
export type NotAllowed = ErrorObject<typeof ErrorCode.NotAllowed, {
    /**
     * Operation name.
     */
    operation: string;
    /**
     * Optional reason.
     */
    reason?: string;
}>;
/**
 * @param operation Operation name.
 * @param reason Optional reason.
 */
export function NotAllowed(operation: string, reason?: string): NotAllowed {
  return {
    code: ErrorCode.NotAllowed,
    message: 'Operation not allowed.',
    details: {
      operation,
      reason,
    },
  };
}

/**
 * Not implemented error
 *
 */
export type NotImplemented = ErrorObject<typeof ErrorCode.NotImplemented>;

export function NotImplemented(): NotImplemented {
  return {
    code: ErrorCode.NotImplemented,
    message: 'Not implemented',
  };
}
