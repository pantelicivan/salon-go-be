// Entities
import { User } from '../../../../database/entities';

export class UserDTO {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.first_name = user.firstName;
    this.last_name = user.lastName;
  }
}

export class UserResponseDTO {
  data: UserDTO;

  constructor(user: User) {
    this.data = new UserDTO(user);
  }
}
