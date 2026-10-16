import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { Account, EmailVerification } from '../entities';

// Repositories
import { BaseRepository } from './base.repository';

@Injectable()
export class EmailVerificationRepository extends BaseRepository<EmailVerification> {
  protected alias: string;
  constructor(
    @InjectRepository(EmailVerification)
    protected repo: Repository<EmailVerification>,
  ) {
    super(repo);
    this.alias = 'emailVerification';
  }

  /**
   * Checks if email verification exists for the given account.
   * @param account - Account entity.
   * @param token - Optional email verification token.
   * @returns Boolean indicating email verification existence.
   */
  async existsForAccount(account: Account, token?: string): Promise<boolean> {
    let existsQuery = 'account_id = $1 and expires_at > NOW()';
    const bindings = [account.id];
    if (token) {
      existsQuery += 'AND id = $2';
      bindings.push(token);
    }
    return this.exists(existsQuery, bindings);
  }
}
