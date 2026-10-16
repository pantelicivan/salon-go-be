import { Injectable, Inject } from '@nestjs/common';
import { Twilio } from 'twilio';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

// Services
import { ConfigService } from '../../../../infrastructure/config/config.service';

// Contracts
import { SmsMessagesProvider } from '../sms-messages-provider.interface';

@Injectable()
export class TwilioProvider implements SmsMessagesProvider {
  private twilio: Twilio;

  constructor(
    private configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    const twilioConfig = this.configService.getTwilioConfig();
    this.twilio = new Twilio(twilioConfig.accountSid, twilioConfig.authToken);
  }

  /**
   * Send an sms message using Twilio provider.
   * @param text - SMS text.
   * @param to - Phone number to which the sms message is sent.
   */
  async sendSmsMessage(text: string, to: string): Promise<void> {
    try {
      const messageInstance = await this.twilio.messages.create({
        body: text,
        to: to,
        from: this.configService.get('TWILIO_FROM_SENDER'),
      });
      this.logger.info('SMS Message sent:', {
        messageInstance,
      });
    } catch (error) {
      this.logger.error('SMS Message sending failed:', {
        text,
        to,
        error,
      });
    }
  }
}
