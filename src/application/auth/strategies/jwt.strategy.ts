import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { isPast, secondsToMilliseconds } from 'date-fns';

// Services
import { ConfigService } from '../../../infrastructure/config/config.service';

// Entities
import { Account } from '../../../database/entities';

// Repositories
import { AccessTokenRepository } from '../../../database/repositories';

// Contracts
import { JwtPayload } from '../contracts/auth.contracts';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private accessTokenRepository: AccessTokenRepository,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(bearerToken: JwtPayload): Promise<Account> {
    if (isPast(secondsToMilliseconds(bearerToken.exp))) {
      throw new UnauthorizedException();
    }

    const accessToken = await this.accessTokenRepository.findByToken(
      bearerToken.jti,
    );

    if (
      !accessToken ||
      accessToken.revoked ||
      isPast(accessToken.expiresAt) ||
      !accessToken.account
    ) {
      throw new UnauthorizedException();
    }

    accessToken.account.setCurrentAuthToken(accessToken);

    return accessToken.account;
  }
}
