import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

// Repositories
import { RefreshTokenRepository } from '../../../database/repositories';

@Injectable()
export class AuthCrons {
  constructor(private refreshTokenRepository: RefreshTokenRepository) {}

  /**
   * Clears invalid OAuth access and refresh tokens for the given interval.
   * Token is invalid if it's revoked or expired.
   * We are only querying refresh tokens delete, because a trigger is set to clear access token after refresh token delete.
   * Access token should not be cleared if it's expired, because it can still be attached to its valid refresh token.
   */
  @Cron(CronExpression.EVERY_12_HOURS)
  clearInvalidOAuthTokens(): void {
    this.refreshTokenRepository.removeInvalidTokens();
  }
}
