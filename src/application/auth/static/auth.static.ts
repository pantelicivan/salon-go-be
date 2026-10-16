export enum SocialProviders {
  FACEBOOK = 'facebook',
  GOOGLE = 'google',
  APPLE = 'apple',
  GITHUB = 'github',
  LINKEDIN = 'linkedin',
}

export enum RoleKeyEnum {
  CLIENT = 'client',
  ADMIN = 'admin',
}

export const JWT_EXP_TIME_IN_SECONDS = 60 * 60 * 24 * 7;
export const ACCESS_TOKEN_EXP_TIME_IN_SECONDS = 60 * 60 * 24;
export const REFRESH_TOKEN_EXP_TIME_IN_SECONDS = 60 * 60 * 24 * 7;

/* 
Password must have at least one lowercase and one uppercase letter.
Digits and special characters are optional.
White spaces are not allowed.
Password length is minimum 6 characters.
*/
export const PASSWORD_REGEX =
  '^(?=.*[a-z])(?=.*[A-Z])[\\w~@#$%^&*+=`|{}:;!.?\\"()\\[\\]\\-]{6,}$';
export const MIN_PASSWORD_LENGTH = 6;
