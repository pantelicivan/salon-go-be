// Contracts
import { ErrorObject } from '../../../../infrastructure/core/results/errors/result';

export type WrongCredentials = ErrorObject<'auth.wrongCredentials'>;
export function WrongCredentials(): WrongCredentials {
  return {
    code: 'auth.wrongCredentials',
    message: 'Invalid credentials.',
  };
}

export type InvalidRefreshToken = ErrorObject<'auth.invalidRefreshToken'>;
export function InvalidRefreshToken(): InvalidRefreshToken {
  return {
    code: 'auth.invalidRefreshToken',
    message: 'Invalid refresh token.',
  };
}

export type InvalidEmailVerificationToken =
  ErrorObject<'auth.invalidEmailVerificationToken'>;
export function InvalidEmailVerificationToken(): InvalidEmailVerificationToken {
  return {
    code: 'auth.invalidEmailVerificationToken',
    message: 'Invalid email verification token.',
  };
}

export type UnsupportedSocialProvider =
  ErrorObject<'auth.unsupportedSocialProvider'>;
export function UnsupportedSocialProvider(): UnsupportedSocialProvider {
  return {
    code: 'auth.unsupportedSocialProvider',
    message: 'Unsupported social provider.',
  };
}

export type InvalidSocialAuthToken = ErrorObject<'auth.invalidSocialAuthToken'>;
export function InvalidSocialAuthToken(): InvalidSocialAuthToken {
  return {
    code: 'auth.invalidSocialAuthToken',
    message: 'Invalid social auth token.',
  };
}

export type SocialAuthenticationFailed =
  ErrorObject<'auth.socialAuthenticationFailed'>;
export function SocialAuthenticationFailed(): SocialAuthenticationFailed {
  return {
    code: 'auth.socialAuthenticationFailed',
    message: 'Social authentication failed.',
  };
}

export type ResetAlreadySent = ErrorObject<'auth.resetAlreadySent'>;
export function ResetAlreadySent(): ResetAlreadySent {
  return {
    code: 'auth.resetAlreadySent',
    message: 'Password reset email has already been sent to the account.',
  };
}

export type ResetPasswordFailed = ErrorObject<'auth.resetPasswordFailed'>;
export function ResetPasswordFailed(): ResetPasswordFailed {
  return {
    code: 'auth.resetPasswordFailed',
    message: 'Password reset failed.',
  };
}

export type EmailAlreadyVerified = ErrorObject<'auth.emailAlreadyVerified'>;
export function EmailAlreadyVerified(): EmailAlreadyVerified {
  return {
    code: 'auth.emailAlreadyVerified',
    message: 'Email already verified.',
  };
}

export type EmailVerificationAlreadySent =
  ErrorObject<'auth.emailVerificationAlreadySent'>;
export function EmailVerificationAlreadySent(): EmailVerificationAlreadySent {
  return {
    code: 'auth.emailVerificationAlreadySent',
    message: 'Verification email already sent.',
  };
}

export type EmailVerificationFailed =
  ErrorObject<'auth.emailVerificationFailed'>;
export function EmailVerificationFailed(): EmailVerificationFailed {
  return {
    code: 'auth.emailVerificationFailed',
    message: 'Email verification failed.',
  };
}

export type EmailAlreadyTaken = ErrorObject<'auth.emailAlreadyTaken'>;
export function EmailAlreadyTaken(): EmailAlreadyTaken {
  return {
    code: 'auth.emailAlreadyTaken',
    message: 'Email has already been taken.',
  };
}
