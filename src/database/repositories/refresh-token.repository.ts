import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { addSeconds, isPast } from 'date-fns';

// Entities
import { OAuthAccessToken, OAuthRefreshToken } from '../entities';

// Repositories
import { BaseRepository } from './base.repository';

// Static
import { REFRESH_TOKEN_EXP_TIME_IN_SECONDS } from '../../application/auth/static/auth.static';

@Injectable()
export class RefreshTokenRepository extends BaseRepository<OAuthRefreshToken> {
  protected alias: string;
  constructor(
    @InjectRepository(OAuthRefreshToken)
    protected repo: Repository<OAuthRefreshToken>,
  ) {
    super(repo);
    this.alias = 'refreshToken';
  }

  /**
   * Returns a valid refresh token by id.
   * Token is valid if it has not been revoked or is not expired.
   * Loads the following relations:
   *  - Access token
   *  - Account
   * @param id - Refresh token id.
   * @returns Refresh token if found.
   */
  async findValidById(id: string): Promise<OAuthRefreshToken | null> {
    const refreshToken = await this.qb()
      .where(`${this.alias}.id = :id`, { id })
      .innerJoinAndSelect(`${this.alias}.accessToken`, 'accessToken')
      .innerJoinAndSelect('accessToken.account', 'account')
      .getOne();

    if (
      !refreshToken ||
      refreshToken.revoked ||
      isPast(refreshToken.expiresAt)
    ) {
      return null;
    }
    return refreshToken;
  }

  /**
   * Creates OAuth refresh token pair for the given OAuth access token.
   * @param accessToken - OAuth access token.
   * @returns Created OAuth refresh token.
   */
  createRefreshToken(
    accessToken: OAuthAccessToken,
  ): Promise<OAuthRefreshToken> {
    return this.create({
      accessTokenId: accessToken.id,
      expiresAt: addSeconds(new Date(), REFRESH_TOKEN_EXP_TIME_IN_SECONDS),
    });
  }

  /**
   * Removed invalid refresh tokens.
   * @returns Delete results.
   */
  async removeInvalidTokens(): Promise<boolean> {
    const results = await this.repo
      .createQueryBuilder()
      .delete()
      .from(OAuthRefreshToken)
      .where('revoked = :revoked', { revoked: true })
      .orWhere('expires_at < :now', { now: new Date() })
      .execute();
    return !!results.affected && results.affected > 0;
  }
}
