import { Factory } from '@concepta/typeorm-seeding';

// Entities
import { Account } from '../entities';

export class AccountFactory extends Factory<Account> {
  protected options = {
    entity: Account,
  };

  protected async entity(data: Account): Promise<Account> {
    const account = new Account();
    account.email = data.email;
    account.password = data.password;
    account.salt = data.salt;
    account.roleId = data.roleId;
    account.emailVerifiedAt = new Date();
    return account;
  }
}
