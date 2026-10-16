import { Seeder } from '@concepta/typeorm-seeding';

// Entities
import { Account } from '../entities';

// Factories
import { AccountFactory, UserFactory } from '../factories';

export class AccountUserSeeder extends Seeder {
  public async run(): Promise<void> {
    const { salt: acc1Salt, passwordHash: acc1PasswordHash } =
      await Account.hashPassword('ivan.pantelic');

    const account = await this.factory(AccountFactory).create({
      email: 'ivan.pantelic@hotmail.com',
      password: acc1PasswordHash,
      salt: acc1Salt,
      roleId: '1a7e092e-201d-4c50-a80e-e2d63d26f291',
    });

    this.factory(UserFactory).create({
      email: account.email,
      firstName: 'Ivan',
      lastName: 'Pantelic',
      accountId: account.id,
    });
  }
}
