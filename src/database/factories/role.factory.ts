import { Factory } from '@concepta/typeorm-seeding';

// Entities
import { Role } from '../entities';

export class RoleFactory extends Factory<Role> {
  protected options = {
    entity: Role,
  };

  protected async entity(data: Role): Promise<Role> {
    const role = new Role();
    role.id = data.id;
    role.name = data.name;
    return role;
  }
}
