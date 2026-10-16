import { ErrorObject } from '../../../infrastructure/core/results/errors/result';

export type UnknownError = ErrorObject<'unknownError'>;
export function UnknownError(): UnknownError {
  return {
    code: 'unknownError',
    message:
      'Request completely failed, a team of highly diverse and gender-fluid humans are working on it.',
  };
}

export type EntityNotFound = ErrorObject<'entityNotFound'>;
export function EntityNotFound(entity = 'Entity'): EntityNotFound {
  return {
    code: 'entityNotFound',
    message: `${entity} not found.`,
    args: {
      entity,
    },
  };
}

export type EntityAlreadyExists = ErrorObject<'entityAlreadyExists'>;
export function EntityAlreadyExists(entity = 'Entity'): EntityAlreadyExists {
  return {
    code: 'entityAlreadyExists',
    message: `${entity} already exists.`,
    args: {
      entity,
    },
  };
}

export type NothingToUpdate = ErrorObject<'nothingToUpdate'>;
export function NothingToUpdate(message?: string): NothingToUpdate {
  return {
    code: 'nothingToUpdate',
    message: message ?? 'Nothing to update.',
  };
}

export type UnexpectedError = ErrorObject<'unexpectedError'>;
export function UnexpectedError(details?: string): UnexpectedError {
  return {
    code: 'unexpectedError',
    message: 'An unexpected error has occurred.',
    details,
  };
}

export type DateFormatError = ErrorObject<'dateFormatError'>;
export function DateFormatError(format: string): DateFormatError {
  return {
    code: 'dateFormatError',
    message: `Please provide date in the following format: '${format}'.`,
    args: {
      format,
    },
  };
}

export type InvalidUUID = ErrorObject<'invalidUUID'>;
export function InvalidUUID(value: string): InvalidUUID {
  return {
    code: 'invalidUUID',
    message: `${value} is not valid uuid.`,
    args: {
      value,
    },
  };
}

export type InvalidPayload = ErrorObject<'invalidPayload'>;
export function InvalidPayload(): InvalidPayload {
  return {
    code: 'invalidPayload',
    message: 'Invalid payload.',
  };
}

export type UpdateFailed = ErrorObject<'updateFailed'>;
export function UpdateFailed(): UpdateFailed {
  return {
    code: 'updateFailed',
    message: 'Update failed.',
  };
}

export type MissingRelation = ErrorObject<'missingRelation'>;
export function MissingRelation(value = ''): MissingRelation {
  return {
    code: 'missingRelation',
    message: `${value} relation is missing.`,
    args: {
      value,
    },
  };
}
