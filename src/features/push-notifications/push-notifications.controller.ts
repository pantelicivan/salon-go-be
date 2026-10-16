import {
  Controller,
  Post,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

// Services
import { PushNotificationsService } from './push-notifications.service';

// Notifications
import { GreetPushNotification } from './notifications';

@ApiTags('Push Notifications')
@Controller('push-notifications')
export class PushNotificationsController {
  constructor(private pushNotificationsService: PushNotificationsService) {}

  /**
   * Sends a demo greet push notification.
   * @returns
   */
  @Post('/greet')
  @HttpCode(204)
  async greet(): Promise<void> {
    const notification = new GreetPushNotification().setTopic('greet');
    if (!this.pushNotificationsService.canSend(notification)) {
      throw new BadRequestException(
        'Neither topic nor receivers have been provided!',
      );
    }
    await this.pushNotificationsService.send(notification);
  }
}
