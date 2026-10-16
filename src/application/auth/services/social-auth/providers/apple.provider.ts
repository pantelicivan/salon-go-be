import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Services
import { ConfigService } from '../../../../../infrastructure/config/config.service';

// Contracts
import { SocialAuthProvider } from './social-auth-provider.interface';
import {
  SocialUser,
  SocialUserResponse,
} from '../../../contracts/auth.contracts';

// Static
import { SocialProviders } from '../../../static/auth.static';

// Async results
import {
  AsyncResult,
  Error,
  Success,
} from '../../../../../infrastructure/core/results/errors/result';

// Errors
import { InvalidSocialAuthToken } from '../../../static/results/auth.errors';

@Injectable()
export class AppleProvider implements SocialAuthProvider {
  private response!: SocialUserResponse & { sub: string; email: string };

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async getUser(
    token: string,
  ): AsyncResult<SocialUser, InvalidSocialAuthToken> {
    const response: any = this.jwtService.decode(token);
    if (!response || response.aud !== this.configService.get('APPLE_AUD')) {
      return Error(InvalidSocialAuthToken());
    }

    this.response = response;
    return Success(this.toSocialUser());
  }

  toSocialUser(): SocialUser {
    return {
      provider: SocialProviders.APPLE,
      externalId: this.response.sub,
      email: this.response.email,
      firstName: this.response.first_name,
      lastName: this.response.last_name,
    };
  }
}
