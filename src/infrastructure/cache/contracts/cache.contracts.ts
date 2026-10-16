export type CacheOptions = {
  host: string;
  port: string;
  auth_pass: string;
};

export type TypeORMCacheConfig = {
  type: 'redis';
  options: CacheOptions;
  // Global duration of query cache in milliseconds
  duration?: number;
};
