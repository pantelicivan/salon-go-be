export const API_PREFIX = 'api/v1';

export const DATABASE_SCHEMA_NAMES = {
  CORE: 'core',
  MIGRATION: 'migration',
};

export const DATABASE_TABLE_NAMES = {
  ACCOUNTS: 'accounts',
  USERS: 'users',
  EMAIL_VERIFICATIONS: 'email_verifications',
  PASSWORD_RESETS: 'password_resets',
  ACCESS_TOKENS: 'oauth_access_tokens',
  REFRESH_TOKENS: 'oauth_refresh_tokens',
  ROLES: 'roles',
  // Polymorphic
  FILES: 'files',
  EXTERNAL_IDS: 'external_ids',
};

export enum FeatureFlagEnum {
  RESIZE_BIG_IMAGES = 'RESIZE_BIG_IMAGES',
  CREATE_IMAGE_THUMBNAILS = 'CREATE_IMAGE_THUMBNAILS',
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export const PAGINATION_MIN_PAGE = 1;
export const PAGINATION_MIN_LIMIT = 1;
export const PAGINATION_MAX_LIMIT = 30;
export const PAGINATION_DEFAULT_LIMIT = 10;
