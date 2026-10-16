// Contracts
import { PushNotification } from '../../push-notification.abstract';
import {
  ApnsConfig,
  AndroidConfig,
  FirebaseMessage,
} from './firebase-notifications.contracts';

export abstract class FirebaseNotification extends PushNotification {
  /** APS thread id is used for notifications grouping on IOS devices. */
  protected apnsThreadId = '';

  /** Should APNS config be sent? */
  protected withApnsConfig = true;

  /** Android channel. */
  protected androidChannel: string | null;

  /** Should Android config be sent? */
  protected withAndroidConfig = true;

  /** Notification's badge count. Used for app icon notifications counter. */
  protected badge: number | null;

  /** Notification's sound. */
  protected sound = 'default';

  /**
   * Sets notification's apns thread id.
   * @param apnsThreadId
   * @returns {FirebaseNotification} - This instance.
   */
  public setApnsThreadId(apnsThreadId = ''): this {
    this.apnsThreadId = apnsThreadId;
    return this;
  }

  /**
   * Gets notification's apns thread id.
   * @returns {string} - Notification's apns thread id.
   */
  public getApnsThreadId(): string {
    return this.apnsThreadId;
  }

  /**
   * Sets if APNS config should be sent.
   * @param shouldInclude
   * @returns {FirebaseNotification} - This instance.
   */
  public setWithApnsConfig(shouldInclude: boolean): this {
    this.withApnsConfig = shouldInclude;
    return this;
  }

  /**
   * Should the APNS config be sent.
   * @returns {boolean} - Should the APNS config be sent.
   */
  public getWithApnsConfig(): boolean {
    return this.withApnsConfig;
  }

  /**
   * Sets notification's android channel.
   * @param androidChannel
   * @returns {FirebaseNotification} - This instance.
   */
  public setAndroidChannel(androidChannel: string | null): this {
    this.androidChannel = androidChannel;
    return this;
  }

  /**
   * Gets notification's android channel.
   * @returns {string | null} - Notification's android channel.
   */
  public getAndroidChannel(): string | null {
    return this.androidChannel;
  }

  /**
   * Sets if Android config should be sent.
   * @param shouldInclude
   * @returns {FirebaseNotification} - This instance.
   */
  public setWithAndroidConfig(shouldInclude: boolean): this {
    this.withAndroidConfig = shouldInclude;
    return this;
  }

  /**
   * Should the Android config be sent.
   * @returns {boolean} - Should the Android config be sent.
   */
  public getWithAndroidConfig(): boolean {
    return this.withAndroidConfig;
  }

  /**
   * Sets notification's badge.
   * @param badge
   * @returns {FirebaseNotification} - This instance.
   */
  public setBadge(badge: number | null): this {
    this.badge = badge;
    return this;
  }

  /**
   * @returns {number | null} Notification's badge.
   */
  public getBadge(): number | null {
    return this.badge;
  }

  /**
   * Sets notification's sound.
   * @param sound
   * @returns {FirebaseNotification} - This instance.
   */
  public setSound(sound: string): this {
    this.sound = sound;
    return this;
  }

  /**
   * Gets notification's sound.
   * @returns {string} - Notification's sound.
   */
  public getSound(): string {
    return this.sound;
  }

  /**
   * Gets APNS (Apple Notification Service) config that is required for IOS notifications.
   * @returns
   */
  public getApnsConfig(): ApnsConfig {
    return {
      headers: {
        'apns-priority': '10',
      },
      payload: {
        aps: {
          alert: {
            title: this.getTitle() ?? '',
            body: this.getBody() ?? '',
          },
          sound: this.getSound(),
          badge: this.getBadge() ?? 0,
          'thread-id': this.getApnsThreadId(),
        },
      },
    };
  }

  /**
   * Gets Android config.
   * @returns
   */
  public getAndroidConfig(): AndroidConfig {
    return {
      notification: {
        title: this.getTitle() ?? '',
        body: this.getBody() ?? '',
        channel_id: this.getAndroidChannel() ?? '',
      },
    };
  }

  /**
   * Converts Firebase notification to Firebase message.
   * @returns {FirebaseMessage} - Firebase message.
   */
  public toFirebaseMessage(): FirebaseMessage {
    const firebaseMessage: FirebaseMessage = {};
    if (this.getTitle() && this.getBody()) {
      firebaseMessage.notification = {
        title: this.getTitle() ?? '',
        body: this.getBody() ?? '',
      };
    }

    if (this.getData()) {
      firebaseMessage.data = this.getData();
    }

    if (this.getWithApnsConfig()) {
      firebaseMessage.apns = this.getApnsConfig();
    }

    if (this.getWithAndroidConfig()) {
      firebaseMessage.android = this.getAndroidConfig();
    }

    return firebaseMessage;
  }
}
