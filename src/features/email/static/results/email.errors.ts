// Contracts
import { ErrorObject } from '../../../../infrastructure/core/results/errors/result';

export type EmailFailed = ErrorObject<'emailFailed'>;
export function EmailFailed(): EmailFailed {
  return {
    code: 'emailFailed',
    message: 'Email failed to send.',
  };
}
