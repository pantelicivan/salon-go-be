import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

// Services
import { ConfigService } from '../config/config.service';
import { CacheService } from './cache.service';

// Modules
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      isGlobal: true,
      useFactory: (configService: ConfigService) => {
        const { host, port, auth_pass } = configService.getCachingOptions();
        const auth = auth_pass ? `:${encodeURIComponent(auth_pass)}@` : '';

        const ttlSeconds = Number.parseInt(configService.get('CACHE_TTL'), 10);

        return {
          stores: [createKeyv(`redis://${auth}${host}:${port}`)],
          ttl: Number.isNaN(ttlSeconds) ? undefined : ttlSeconds * 1000,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class ApplicationCacheModule {}
