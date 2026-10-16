// Contracts
import { SuccessObject } from '../../../../infrastructure/core/results/success/result';

export type VerificationEmailSent = SuccessObject<'auth.verificationEmailSent'>;
export function VerificationEmailSent(): VerificationEmailSent {
  return {
    code: 'auth.verificationEmailSent',
    message: 'Verification email sent.',
  };
}

export type PasswordChanged = SuccessObject<'auth.passwordChanged'>;
export function PasswordChanged(): PasswordChanged {
  return {
    code: 'auth.passwordChanged',
    message: 'Password successfully changed.',
  };
}

export type ForgotPasswordSent = SuccessObject<'auth.forgotPasswordSent'>;
export function ForgotPasswordSent(): ForgotPasswordSent {
  return {
    code: 'auth.forgotPasswordSent',
    message: 'Password reset email has been sent.',
  };
}

export type PasswordReset = SuccessObject<'auth.passwordReset'>;
export function PasswordReset(): PasswordReset {
  return {
    code: 'auth.passwordReset',
    message: 'Password has been reset successfully.',
  };
}

export type EmailVerified = SuccessObject<'auth.emailVerified'>;
export function EmailVerified(): EmailVerified {
  return {
    code: 'auth.emailVerified',
    message: 'Email successfully verified.',
  };
}
