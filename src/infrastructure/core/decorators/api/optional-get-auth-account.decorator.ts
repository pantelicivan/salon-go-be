import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Entities
import { Account } from '../../../../database/entities';

export const GetOptionalAuthAccount = createParamDecorator(
  (data: unknown, context: ExecutionContext): Account | null => {
    const request = context.switchToHttp().getRequest();
    return request.user || null;
  },
);
