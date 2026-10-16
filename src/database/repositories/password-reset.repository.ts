import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isPast } from 'date-fns';
import { Repository } from 'typeorm';

// Entities
import { Account, PasswordReset } from '../entities';

// Repositories
import { BaseRepository } from './base.repository';

@Injectable()
export class PasswordResetRepository extends BaseRepository<PasswordReset> {
  protected alias: string;

  constructor(
    @InjectRepository(PasswordReset) protected repo: Repository<PasswordReset>,
  ) {
    super(repo);
    this.alias = 'passwordReset';
  }

  /**
   * Finds a valid password reset by token value.
   * Password reset is valid if it has not expired.
   * Loads the following relations:
   * - Account
   * @param token - Password reset token.
   * @returns Password reset if found.
   */
  async findValid(token: string): Promise<PasswordReset | null> {
    const passwordReset = await this.qb()
      .where(`${this.alias}.id = :token`, { token })
      .innerJoinAndSelect(`${this.alias}.account`, 'account')
      .getOne();
    if (!passwordReset || isPast(passwordReset.expiresAt)) {
      return null;
    }
    return passwordReset;
  }

  /**
   * Checks if password reset exists for the given account.
   * @param account - Account entity.
   * @param token - Optional password reset token.
   * @returns Boolean indicating password reset existence.
   */
  existsForAccount(account: Account, token?: string): Promise<boolean> {
    let existsQuery = 'account_id = $1 and expires_at > NOW()';
    const bindings = [account.id];
    if (token) {
      existsQuery += 'AND id = $2';
      bindings.push(token);
    }
    return this.exists(existsQuery, bindings);
  }
}
