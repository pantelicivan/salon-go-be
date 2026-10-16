// Contracts
import { FirebaseNotification } from './firebase/contracts/firebase-notification.abstract';

export class GreetPushNotification extends FirebaseNotification {
  constructor() {
    super();
    this.setTitle('Welcome!').setBody('Welcome to our application!');
  }
}
