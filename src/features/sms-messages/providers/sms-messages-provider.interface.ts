export interface SmsMessagesProvider {
  sendSmsMessage(text: string, to: string): Promise<any>;
}
