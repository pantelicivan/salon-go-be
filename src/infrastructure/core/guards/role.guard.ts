import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// Entities
import { Role, Account } from '../../../database/entities';

// Static
import { RoleKeyEnum } from '../../../application/auth/static/auth.static';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesFromHandler =
      this.reflector.get<RoleKeyEnum[]>('roles', context.getHandler()) || [];
    const rolesFromClass =
      this.reflector.get<RoleKeyEnum[]>('roles', context.getClass()) || [];
    const roles = [...rolesFromClass, ...rolesFromHandler];

    if (roles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const account = request.user as Account;
    if (!account.role) {
      return false;
    }
    return this.matchRoles(roles, account.role);
  }

  matchRoles(roles: RoleKeyEnum[], userRole: Role): boolean {
    return roles.includes(userRole.key);
  }
}
