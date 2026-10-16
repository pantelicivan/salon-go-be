// Entities
import { Role, User } from '../../../../database/entities';

// Contracts
import { AuthTokens } from '../../contracts/auth.contracts';

// Response DTO
import { UserDTO } from '../../../user/dtos/res/user.dto';

export class AuthResponseDTO {
  data: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };

  constructor(authTokens: AuthTokens) {
    this.data = {
      access_token: authTokens.bearerTokens.accessToken,
      refresh_token: authTokens.bearerTokens.refreshToken,
      expires_at: authTokens.oAuthTokens.accessToken.expiresAt.getTime(),
    };
  }
}

export class AuthUserResponseDTO {
  data: UserDTO;

  constructor(user: User) {
    this.data = new UserDTO(user);
  }
}

export class RoleDTO {
  id: string;
  name: string;

  constructor(role: Role) {
    this.id = role.id;
    this.name = role.name;
  }
}

export class RolesResponseDTO {
  data: RoleDTO[];

  constructor(roles: Role[]) {
    this.data = roles.map((role) => new RoleDTO(role));
  }
}
