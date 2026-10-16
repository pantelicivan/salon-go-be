import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { addSeconds } from 'date-fns';

// Entities
import { Account, OAuthAccessToken } from '../entities';

// Repositories
import { BaseRepository } from './base.repository';

// Static
import { ACCESS_TOKEN_EXP_TIME_IN_SECONDS } from '../../application/auth/static/auth.static';
import { CACHE_DURATIONS } from '../../infrastructure/cache/static/cache.static';

@Injectable()
export class AccessTokenRepository extends BaseRepository<OAuthAccessToken> {
  protected alias: string;

  constructor(
    @InjectRepository(OAuthAccessToken)
    protected repo: Repository<OAuthAccessToken>,
  ) {
    super(repo);
    this.alias = 'accessToken';
  }

  /**
   * Finds an OAuthAccessToken by the given token value.
   * Loads the following relations:
   * - Account
   * - Account's role
   * - User
   * @param token - Access token's id.
   * @returns OAuthAccessToken.
   */
  findByToken(token: string): Promise<OAuthAccessToken | null> {
    return this.qb()
      .where(`${this.alias}.id = :id`, { id: token })
      .innerJoinAndSelect(`${this.alias}.account`, 'account')
      .innerJoinAndSelect('account.role', 'role')
      .innerJoinAndSelect('account.user', 'user')
      .cache(CACHE_DURATIONS.MID)
      .getOne();
  }

  /**
   * Creates OAuth access token for the given account.
   * @param account - Account entity.
   * @returns Created OAuth access token.
   */
  createAccessToken(account: Account): Promise<OAuthAccessToken> {
    return this.create({
      accountId: account.id,
      expiresAt: addSeconds(new Date(), ACCESS_TOKEN_EXP_TIME_IN_SECONDS),
    });
  }
}
