// Contracts
import { PushNotification } from '../notifications/push-notification.abstract';

export interface PushNotificationsProvider {
  canSend(pushNotification: PushNotification): boolean;
  send(pushNotification: PushNotification): Promise<any>;
}
