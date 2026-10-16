import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HeaderResolver, I18nJsonLoader, I18nModule } from 'nestjs-i18n';
import * as path from 'path';
import { WinstonModule } from 'nest-winston';
// Transactions
import { DataSource, DataSourceOptions } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

// Modules
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

// Independent integration modules
import { ConfigModule } from '../infrastructure/config/config.module';
import { FileManagementModule } from '../features/file-management/file-management.module';
import { SmsMessagesModule } from '../features/sms-messages/sms-messages.module';
import { PushNotificationsModule } from '../features/push-notifications/push-notifications.module';
import { ApplicationCacheModule } from '../infrastructure/cache/cache.module';

// Services
import { ConfigService } from '../infrastructure/config/config.service';
import { TranslationService } from '../infrastructure/i18n/translation.service';

// Core
import { ServerExceptionFilter } from '../infrastructure/core/filters/exception/server-exception.filter';
import { HttpExceptionFilter } from '../infrastructure/core/filters/exception/http-exception.filter';
import { TranslationInterceptor } from '../infrastructure/core/interceptors/translation.interceptor';

// Static
import { LOCALE } from '../infrastructure/i18n/localization.static';
import { loggerTransports } from '../common/static/logger.static';

@Module({
  imports: [
    // Libraries
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.getTypeOrmConfig(),
      async dataSourceFactory(options: DataSourceOptions) {
        // Applying transactional functionality.
        const dataSource = await new DataSource(options).initialize();
        return addTransactionalDataSource(dataSource);
      },
    }),
    WinstonModule.forRoot({
      transports: loggerTransports,
    }),
    I18nModule.forRoot({
      fallbackLanguage: LOCALE.EN,
      loader: I18nJsonLoader,
      loaderOptions: {
        path: path.join(__dirname, '../infrastructure/i18n/'),
      },
      resolvers: [new HeaderResolver(['x-locale'])],
    }),
    ScheduleModule.forRoot(),
    // Independent integration modules
    ConfigModule,
    FileManagementModule,
    SmsMessagesModule,
    PushNotificationsModule,
    // Domain modules
    AuthModule,
    UserModule,
    // Cache module
    ApplicationCacheModule,
  ],
  providers: [
    HttpExceptionFilter,
    TranslationService,
    {
      provide: APP_FILTER,
      useClass: ServerExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TranslationInterceptor,
    },
  ],
})
export class AppModule {}
