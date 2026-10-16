import { Controller, Post, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

// Services
import { SmsMessagesService } from './sms-messages.service';

@ApiTags('SMS Messages')
@Controller('sms-messages')
export class SmsMessagesController {
  constructor(private smsMessagesService: SmsMessagesService) {}

  /**
   * Sends a greet sms message.
   * @returns
   */
  @Post('greet')
  @HttpCode(204)
  sendGreet(): Promise<void> {
    return this.smsMessagesService.sendSmsMessage(
      'Hey! This is a test message.',
      '+yourPhoneNumber',
    );
  }
}
