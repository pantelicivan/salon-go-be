import { Injectable } from '@nestjs/common';

// Services
import { TwilioProvider } from './providers/twilio/twilio.provider';

// Contracts
import { SmsMessagesProvider } from './providers/sms-messages-provider.interface';

@Injectable()
export class SmsMessagesService {
  private provider: SmsMessagesProvider;

  constructor(twilioProvider: TwilioProvider) {
    this.provider = twilioProvider;
  }

  /**
   * Sends an sms message.
   * @param text - SMS text.
   * @param to - Phone number to which the sms message is sent.
   */
  async sendSmsMessage(text: string, to: string): Promise<void> {
    return this.provider.sendSmsMessage(text, to);
  }
}
