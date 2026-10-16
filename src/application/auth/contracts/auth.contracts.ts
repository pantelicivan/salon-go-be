// Entities
import {
  OAuthAccessToken,
  OAuthRefreshToken,
} from '../../../database/entities';

export type JwtPayload = {
  jti: string;
  sub: string;
  iat: number;
  exp: number;
};

export type OAuthTokens = {
  accessToken: OAuthAccessToken;
  refreshToken: OAuthRefreshToken;
};

export type BearerTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthTokens = {
  oAuthTokens: OAuthTokens;
  bearerTokens: BearerTokens;
};

export type RegisterAccountPayload = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export type AccountRegistrationData = {
  email: string;
  password?: string;
  salt?: string;
  roleId: string;
  firstName?: string;
  lastName?: string;
  emailVerifiedAt?: Date;
};

export type PasswordHash = {
  passwordHash: string;
  salt: string;
};

export type SocialUser = {
  provider: string;
  externalId: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

export type SocialUserResponse = {
  id?: string;
  sub?: string;
  email?: string;
  first_name?: string;
  given_name?: string;
  last_name?: string;
  family_name?: string;
  localizedFirstName?: string;
  localizedLastName?: string;
};

export type AdditionalUserData = {
  firstName?: string;
  lastName?: string;
};
