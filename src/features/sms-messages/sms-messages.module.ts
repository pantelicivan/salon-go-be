import { Module } from '@nestjs/common';

// Modules
import { ConfigModule } from '../../infrastructure/config/config.module';

// Controllers
import { SmsMessagesController } from './sms-messages.controller';

// Services
import { SmsMessagesService } from './sms-messages.service';
import { TwilioProvider } from './providers/twilio/twilio.provider';

@Module({
  imports: [ConfigModule],
  controllers: [SmsMessagesController],
  providers: [SmsMessagesService, TwilioProvider],
  exports: [SmsMessagesService],
})
export class SmsMessagesModule {}
