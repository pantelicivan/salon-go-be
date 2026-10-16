import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Entities
import { Account } from '../../../../database/entities';

export const GetAuthAccount = createParamDecorator(
  (data: unknown, context: ExecutionContext): Account => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
