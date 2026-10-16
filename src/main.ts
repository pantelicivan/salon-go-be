import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
// Transactions
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional';

// Modules
import { AppModule } from './application/app.module';

// Services
import { ConfigService } from './infrastructure/config/config.service';

// Constants
import { API_PREFIX } from './common/static/application.static';

async function bootstrap(): Promise<void> {
  initializeTransactionalContext({
    storageDriver: StorageDriver.ASYNC_LOCAL_STORAGE,
  });
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (validationErrors): BadRequestException => {
        return new BadRequestException(validationErrors);
      },
    }),
  );

  const options = new DocumentBuilder()
    .setTitle('Nest.js core project')
    .setVersion('0.0.1')
    .addTag('Auth')
    .addTag('Users')
    .addTag('File Management')
    .addTag('Push Notifications')
    .addTag('SMS Messages')
    .addBearerAuth()
    .build();

  app.setGlobalPrefix(API_PREFIX);
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
  await app.listen(app.get(ConfigService).get('PORT'));
}
bootstrap();
