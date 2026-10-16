/**
 * Error representation.
 */

import { stackTrace } from './stack-trace';

export type ErrorObject<
  T extends string,
  U extends Record<string, unknown> | void = void,
> = {
  /**
   * Error code.
   */
  code: T;

  /**
   * Error description message. This can be treated as a fallback message if the translation fails.
   */
  message: string;

  /**
   * Arguments that can be passed to the translation service.
   */
  args?: Record<string, string>;
} & (U extends void
  ? Record<string, unknown>
  : {
      /**
       * Additional error details.
       */
      details: U;
    });

/**
 * A type that every ErrorObject is assignable to.
 */
export type ErrorLike = ErrorObject<string>;

/**
 * Successful result of some operation.
 */
export interface SuccessResult<T = void> {
  /**
   * Result status.
   */
  readonly status: 'OK';
  /**
   * Result value.
   */
  readonly value: T;

  isError(): boolean;
  isOk(): boolean;
}

/**
 * Failure result of some operation.
 */
export interface ErrorResult<E extends ErrorLike> {
  /**
   * Result status.
   */
  readonly status: 'ERR';
  /**
   * An array of error objects.
   */
  readonly error: E;

  isError(): boolean;
  isOk(): boolean;
}

/**
 * Result of an operation that may fail.
 */
export type Result<T = unknown, E extends ErrorLike = ErrorLike> =
  | SuccessResult<T>
  | ErrorResult<E>;

/**
 * Result of an asynchronous operation that may fail.
 */
export type AsyncResult<T = unknown, E extends ErrorLike = ErrorLike> = Promise<
  Result<T, E>
>;

/**
 * Returns true if the provided Result is a Success.
 */
export function isOK<T, E extends ErrorLike>(
  result: Result<T, E>,
): result is SuccessResult<T> {
  return result.status === 'OK';
}

/**
 * Returns true if the provided Result is a Failure.
 */
export function isErr<T, E extends ErrorLike>(
  result: Result<T, E>,
): result is ErrorResult<E> {
  return result.status === 'ERR';
}

export function isError<T, E extends ErrorLike>(
  result: Result<T, E>,
  error: E,
): result is ErrorResult<E> {
  return result.status === 'ERR' && result.error.code == error.code;
}

export function isErrorType<E extends ErrorLike, C extends E>(
  result: ErrorResult<E>,
  error: C,
): result is ErrorResult<C> {
  return result.status === 'ERR' && result.error.code == error.code;
}

export function error<E extends ErrorLike>(result: ErrorResult<E>): E {
  return result.error;
}
/**
 * Returns an empty Success result.
 */
export function Success(): SuccessResult<void>;
/**
 * Returns the Success result with the provided value.
 */
export function Success<T>(value: T): SuccessResult<T>;
export function Success<T>(value?: T): SuccessResult<T | void> {
  if (value === undefined) {
    return {
      status: 'OK',
      isError: () => false,
      isOk: () => true,
    } as SuccessResult<void>;
  }
  return {
    status: 'OK',
    value: value,
    isError: () => false,
    isOk: () => true,
  } as SuccessResult<T>;
}

/**
 * Returns a Failure result with the provided error object.
 */
export function Error<E extends ErrorLike>(error: E): ErrorResult<E>;
/**
 * Returns a Failure result with the provided error objects.
 */
export function Error<E extends ErrorLike>(errors: E[]): ErrorResult<E>;
export function Error<E extends ErrorLike>(err: E | E[]): ErrorResult<E> {
  const errors = ([] as E[]).concat(err);
  /* istanbul ignore next */
  if (process.env.NODE_ENV !== 'production') {
    // add stack prop to every error object with the top frame (this function) stripped
    const stack = stackTrace();
    if (stack) {
      for (let i = 0; i < errors.length; i++) {
        errors[i] = {
          ...errors[i],
          stack: `Error ${errors[i].code}: ${errors[i].message}\n${stack}`,
        } as E;
      }

      if (Object.isFrozen(err)) {
        Object.freeze(errors);
      }
    }
  }
  return {
    status: 'ERR',
    error: errors[0],
    isError: () => true,
    isOk: () => false,
  };
}
