import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import {
  BatchResponse,
  getMessaging,
  Messaging,
} from 'firebase-admin/messaging';
import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

// Services
import { ConfigService } from '../../../../infrastructure/config/config.service';

// Contacts
import { PushNotificationsProvider } from '../push-notifications-provider.interface';
import { FirebaseNotification } from '../../notifications/firebase/contracts/firebase-notification.abstract';

@Injectable()
export class FirebaseProvider implements PushNotificationsProvider {
  private static DEVICE_TOKENS_PER_MESSAGE_LIMIT = 500;
  private firebase: App;
  private messaging: Messaging;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private configService: ConfigService,
  ) {}

  /**
   * Return Firebase app instance.
   * @returns {App} - Firebase instance
   */
  getFirebaseInstance(): App {
    if (!this.firebase) {
      // Reuse the default app if it was already initialized (e.g. hot reload).
      this.firebase =
        getApps()[0] ??
        initializeApp({
          credential: cert(this.configService.getFirebaseConfig()),
        });
    }
    return this.firebase;
  }

  /**
   * Returns Firebase messaging instance.
   * @returns {Messaging} - Firebase messaging instance
   */
  getMessagingInstance(): Messaging {
    if (!this.messaging) {
      this.messaging = getMessaging(this.getFirebaseInstance());
    }
    return this.messaging;
  }

  /**
   * Determines if the Firebase notification can be sent
   * @param firebaseNotification - Firebase notification
   * @returns {boolean} - Can it be sent
   */
  canSend(firebaseNotification: FirebaseNotification): boolean {
    return (
      firebaseNotification.getTopic() !== null ||
      firebaseNotification.getReceivers() !== null
    );
  }

  /**
   * Sends Firebase push notification.
   * @param {FirebaseNotification} firebaseNotification - Firebase push notification
   * @returns {void}
   */
  send(firebaseNotification: FirebaseNotification): Promise<void> {
    if (firebaseNotification.getTopic() !== null) {
      return this.sendToTopic(firebaseNotification);
    }
    return this.sendToReceivers(firebaseNotification);
  }

  /**
   * Sends push notification to the provided topic.
   * @param {FirebaseNotification} firebaseNotification - Firebase notification
   */
  async sendToTopic(firebaseNotification: FirebaseNotification): Promise<void> {
    const topic = firebaseNotification.getTopic();
    if (!topic) {
      return;
    }

    await this.getMessagingInstance().send({
      ...firebaseNotification.toFirebaseMessage(),
      topic,
    });
    this.logger.info('Push notification sent:', {
      notification: firebaseNotification,
    });
  }

  /**
   * Sends push notification to the provided receivers through device tokens.
   * @param {FirebaseNotification} firebaseNotification - Firebase notification
   */
  async sendToReceivers(
    firebaseNotification: FirebaseNotification,
  ): Promise<void> {
    const receivers = firebaseNotification.getReceivers();
    if (!receivers) {
      return;
    }

    const limit = FirebaseProvider.DEVICE_TOKENS_PER_MESSAGE_LIMIT;
    for (let start = 0; start < receivers.length; start += limit) {
      const tokens = receivers.slice(start, start + limit);
      const batchResponse =
        await this.getMessagingInstance().sendEachForMulticast({
          ...firebaseNotification.toFirebaseMessage(),
          tokens,
        });
      this.logBatchResults(batchResponse, firebaseNotification);
    }
  }

  /**
   * Logs Firebase batch response results.
   * @param batchResponse
   * @param firebaseNotification
   * @returns {void}
   */
  private logBatchResults(
    batchResponse: BatchResponse,
    firebaseNotification: FirebaseNotification,
  ): void {
    if (batchResponse.failureCount) {
      this.logger.error('Push notifications batch failed', {
        service: FirebaseProvider.name,
        notification: firebaseNotification,
        failureCount: batchResponse.failureCount,
      });
      return;
    }
    this.logger.info('Push notification sent:', {
      notification: firebaseNotification,
      successCount: batchResponse.successCount,
    });
  }
}
