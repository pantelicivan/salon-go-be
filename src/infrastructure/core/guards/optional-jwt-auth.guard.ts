import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Entities
import { Account } from '../../../database/entities';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, account: Account): any {
    if (err) return null;

    return account;
  }
}
