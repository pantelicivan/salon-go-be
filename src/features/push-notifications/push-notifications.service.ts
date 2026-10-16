import { Injectable } from '@nestjs/common';

// Services
import { FirebaseProvider } from './providers/firebase/firebase.provider';

// Contracts
import { PushNotificationsProvider } from './providers/push-notifications-provider.interface';
import { PushNotification } from './notifications/push-notification.abstract';

@Injectable()
export class PushNotificationsService {
  private provider: PushNotificationsProvider;

  constructor(firebaseProvider: FirebaseProvider) {
    this.provider = firebaseProvider;
  }

  /**
   * Checks if push notification can be sent.
   * @param {PushNotification} pushNotification - Push notification.
   * @returns {boolean} - Can notification be sent.
   */
  canSend(pushNotification: PushNotification): boolean {
    return this.provider.canSend(pushNotification);
  }

  /**
   * Sends the provided push notification.
   * @param {PushNotification} pushNotification - Push notification.
   * @returns {any} - Unknown yet
   */
  send(pushNotification: PushNotification): Promise<void> {
    return this.provider.send(pushNotification);
  }
}
