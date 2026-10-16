import { Seeder } from '@concepta/typeorm-seeding';

// Seeders
import { RoleSeeder } from '.';

export class RootSeeder extends Seeder {
  async run(): Promise<void> {
    await this.call([RoleSeeder]);
  }
}
