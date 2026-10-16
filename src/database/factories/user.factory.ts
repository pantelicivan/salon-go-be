import { Factory } from '@concepta/typeorm-seeding';

// Entities
import { User } from '../entities';

export class UserFactory extends Factory<User> {
  protected options = {
    entity: User,
  };

  protected async entity(data: User): Promise<User> {
    const user = new User();
    user.email = data.email;
    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.accountId = data.accountId;
    return user;
  }
}
