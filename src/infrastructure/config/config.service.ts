import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SeedingSourceOptions } from '@concepta/typeorm-seeding/dist/types';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Contracts
import { TwilioConfig } from '../../features/sms-messages/providers/twilio/contracts/twilio.contracts';
import { FirebaseConfig } from '../../features/push-notifications/providers/firebase/contracts/firebase.contracts';
import {
  TypeORMCacheConfig,
  CacheOptions,
} from '../cache/contracts/cache.contracts';

// Domain
import {
  AccountUserSeeder,
  RoleSeeder,
  RootSeeder,
} from '../../database/seeds';

// Static
import {
  DATABASE_SCHEMA_NAMES,
  FeatureFlagEnum,
} from '../../common/static/application.static';

@Injectable()
export class ConfigService {
  private readonly envConfig: Record<string, string | undefined>;
  private TEST_ENV: boolean;

  constructor() {
    this.TEST_ENV = process.env.NODE_ENV === 'test';
    if (this.TEST_ENV) {
      this.envConfig = dotenv.parse(fs.readFileSync('.env.test'));
      return;
    }
    dotenv.config();
    this.envConfig = process.env;
  }

  /**
   * Returns an ENV entry by key.
   * @param key - Key string.
   * @returns - ENV value.
   */
  get(key: string): string {
    return this.envConfig[key] || '';
  }

  /**
   * @returns TypeORM config.
   */
  getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.get('DATABASE_HOST'),
      port: parseInt(this.get('DATABASE_PORT')),
      username: this.get('DATABASE_USER'),
      password: this.get('DATABASE_PASSWORD'),
      database: this.get('DATABASE_NAME'),
      ssl:
        this.get('DATABASE_SSL') === 'true'
          ? {
              ca: fs.readFileSync(
                __dirname +
                  '/../../../database-certificates/' +
                  this.get('DATABASE_SSL_CERTIFICATE_NAME'),
              ),
            }
          : false,
      entities: [__dirname + '/../../database/entities/**/*.entity{.ts,.js}'],
      // We are using migrations, synchronize should be set to false.
      synchronize: false,
      // Run migrations automatically,
      // you can disable this if you prefer running migration manually.
      migrationsRun: false,
      logging: this.get('DATABASE_LOGGING') == 'true',
      // logger: 'file',
      // allow both start:prod and start:dev to use migrations
      // __dirname is either dist or src folder, meaning either
      // the compiled js in prod or the ts in dev
      migrations: [__dirname + '/../../database/migrations/**/*{.ts,.js}'],
      schema: DATABASE_SCHEMA_NAMES.MIGRATION,
      cache:
        this.get('DATABASE_CACHING') == 'true'
          ? this.getTypeORMCachingConfig()
          : false,
    };
  }

  /**
   * Default duration of the cache is 1000ms (1 second).
   * @returns Caching config
   */
  getTypeORMCachingConfig(): TypeORMCacheConfig {
    return {
      type: 'redis',
      options: this.getCachingOptions(),
    };
  }

  /**
   * @returns Caching options
   */
  getCachingOptions(): CacheOptions {
    return {
      host: this.get('CACHE_HOST'),
      port: this.get('CACHE_PORT'),
      auth_pass: this.get('CACHE_PASSWORD'),
    };
  }

  /**
   * @returns Config for TypeORM seeding.
   */
  getSeedingConfig(): Pick<SeedingSourceOptions, 'seeders' | 'defaultSeeders'> {
    return {
      seeders: [RootSeeder, RoleSeeder, AccountUserSeeder],
      defaultSeeders: [RootSeeder],
    };
  }

  /**
   * Returns Twilio config.
   * @returns {TwilioConfig} - Twilio Config
   */
  getTwilioConfig(): TwilioConfig {
    return {
      accountSid: this.get('TWILIO_ACCOUNT_SID') || 'ACUnknown',
      authToken: this.get('TWILIO_AUTH_TOKEN') || 'unknown',
    };
  }

  /**
   * Returns Firebase config.
   * @returns {FirebaseConfig} - Firebase Config
   */
  getFirebaseConfig(): FirebaseConfig {
    return {
      type: this.get('FIREBASE_TYPE'),
      projectId: this.get('FIREBASE_PROJECT_ID'),
      privateKeyId: this.get('FIREBASE_PRIVATE_KEY_ID'),
      privateKey: this.get('FIREBASE_PRIVATE_KEY'),
      clientEmail: this.get('FIREBASE_CLIENT_EMAIL'),
      clientId: this.get('FIREBASE_CLIENT_ID'),
      authUri: this.get('FIREBASE_AUTH_URI'),
      tokenUri: this.get('FIREBASE_TOKEN_URI'),
      authProviderX509CertUrl: this.get('FIREBASE_AUTH_PROVIDER_X509_CERT_URL'),
      clientX509CertUrl: this.get('FIREBASE_CLIENT_X509_CERT_URL'),
    };
  }

  /**
   * Checks if the given feature is enabled.
   * @param featureFlag
   * @returns Boolean indicating if the feature is enabled.
   */
  featureEnabled(featureFlag: FeatureFlagEnum): boolean {
    return this.envConfig[featureFlag] == 'true';
  }
}
