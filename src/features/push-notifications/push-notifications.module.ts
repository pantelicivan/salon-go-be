import { Module } from '@nestjs/common';

// Modules
import { ConfigModule } from '../../infrastructure/config/config.module';

// Controllers
import { PushNotificationsController } from './push-notifications.controller';

// Services
import { PushNotificationsService } from './push-notifications.service';
import { FirebaseProvider } from './providers/firebase/firebase.provider';

@Module({
  imports: [ConfigModule],
  controllers: [PushNotificationsController],
  providers: [PushNotificationsService, FirebaseProvider],
  exports: [PushNotificationsService],
})
export class PushNotificationsModule {}
