import { Inject, Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

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

// Utils
import { getRandomNumber } from '../../../../../common/utils';

const GET_USER_URL = 'https://api.github.com/user';
const GET_ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';

@Injectable()
export class GitHubProvider implements SocialAuthProvider {
  private instance: AxiosInstance;
  private response: SocialUserResponse & {
    id: string;
    email: string;
    login: string; // Represents the username of the authenticated user.
  };

  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.instance = axios.create();
  }

  /**
   * Exchanges the authorisation code for the access token and retrieves the user associated with it.
   * @param code - GitHub Authorisation code.
   * @returns Social user.
   */
  async getUser(code: string): AsyncResult<SocialUser, InvalidSocialAuthToken> {
    try {
      const accessToken = await this.getAccessToken(code);
      const user = await this.getUserProfile(accessToken);
      this.response = user;
      return Success(this.toSocialUser());
    } catch (err) {
      this.logger.error('Social auth - GitHub provider error:', {
        err,
      });
      return Error(InvalidSocialAuthToken());
    }
  }

  // TODO - Github needs additional configuration because email can be nullable if github profile is set to private options.
  toSocialUser(): SocialUser {
    return {
      provider: SocialProviders.GITHUB,
      externalId: this.response.id,
      email:
        this.response.email ??
        `test.${this.response.first_name}+${getRandomNumber(
          1,
          100,
        )}@github.com`,
      firstName: this.response.first_name,
      lastName: 'GitHub',
    };
  }

  /**
   * Exchanges authorization code for the bearer access token.
   * @param code - GitHub Authorization code
   * @returns Bearer access token.
   */
  private async getAccessToken(code: string): Promise<string> {
    const response = await this.instance.post(
      GET_ACCESS_TOKEN_URL,
      {
        code,
        client_id: this.configService.get('GITHUB_CLIENT_ID'),
        client_secret: this.configService.get('GITHUB_CLIENT_SECRET'),
        redirect_uri: this.configService.get('GITHUB_REDIRECT_URI'),
      },
      { headers: { Accept: 'application/json' } },
    );
    return response.data.access_token;
  }

  /**
   * Retrieves the user associated to the given access token.
   * @param accessToken - Access token.
   * @returns The authenticated GitHub user.
   */
  private async getUserProfile(accessToken: string): Promise<any> {
    const response = await this.instance({
      method: 'get',
      url: GET_USER_URL,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  }
}
