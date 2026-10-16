import { Seeder } from '@concepta/typeorm-seeding';

// Factories
import { RoleFactory } from '../factories';

// Seeders
import { AccountUserSeeder } from './account-user.seeder';

// Static
import { RoleKeyEnum } from '../../application/auth/static/auth.static';

export class RoleSeeder extends Seeder {
  public async run(): Promise<void> {
    await Promise.all([
      this.factory(RoleFactory).create({
        id: 'a2173f7a-dab9-4330-8798-c61a57476c95',
        name: 'Admin',
        key: RoleKeyEnum.ADMIN,
      }),
      this.factory(RoleFactory).create({
        id: '1a7e092e-201d-4c50-a80e-e2d63d26f291',
        name: 'Client',
        key: RoleKeyEnum.CLIENT,
      }),
    ]);

    await this.call([AccountUserSeeder]);
  }
}
