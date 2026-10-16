import { Inject, Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as querystring from 'querystring';
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

// URL CONSTANTS
const GET_USER_URL = 'https://api.linkedin.com/v2/me';
const GET_USER_EMAIL_URL =
  'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))';
const GET_ACCESS_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';

@Injectable()
export class LinkedInProvider implements SocialAuthProvider {
  private instance: AxiosInstance;
  private response: SocialUserResponse & {
    id: string;
  };

  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.instance = axios.create();
  }

  /**
   * LinkedIn should pass authorization code instead of access token.
   * @param code - Authorization code.
   * @returns social user.
   */
  async getUser(code: string): AsyncResult<SocialUser, InvalidSocialAuthToken> {
    try {
      const accessToken = await this.getAccessToken(code);

      const [userResponse, userEmailResponse] = await Promise.all([
        this.getUserProfile(accessToken),
        this.getUserEmail(accessToken),
      ]);

      this.response = {
        ...userResponse.data,
        email: userEmailResponse.data.elements[0]['handle~']?.emailAddress,
      };
      return Success(this.toSocialUser());
    } catch (err) {
      this.logger.error('Social auth - LinkedIn provider error:', {
        err,
      });
      return Error(InvalidSocialAuthToken());
    }
  }

  // * NOTE: Email should be provided by linkedin
  toSocialUser(): SocialUser {
    return {
      provider: SocialProviders.LINKEDIN,
      externalId: this.response.id,
      email:
        this.response.email ??
        `test.${this.response.first_name}+${getRandomNumber(
          1,
          100,
        )}@linkedin.com`,
      firstName: this.response.localizedFirstName,
      lastName: this.response.localizedLastName,
    };
  }

  /**
   * Exchanges authorization code for the bearer access token.
   * @param code - LinkedIn Authorization code
   * @returns Bearer access token.
   */
  private async getAccessToken(code: string): Promise<string> {
    const response = await this.instance.post(
      GET_ACCESS_TOKEN_URL,
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: this.configService.get('LINKEDIN_CLIENT_ID'),
        client_secret: this.configService.get('LINKEDIN_CLIENT_SECRET'),
        redirect_uri: this.configService.get('LINKEDIN_REDIRECT_URI'),
      }),
    );
    return response.data.access_token;
  }

  /**
   * @param accessToken - Access token.
   * @returns axios response.
   */
  private getUserProfile(
    accessToken: string,
  ): Promise<AxiosResponse<any, any>> {
    return this.instance({
      method: 'get',
      url: GET_USER_URL,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  /**
   * @param accessToken - Access token.
   * @returns axios response.
   */
  private getUserEmail(accessToken: string): Promise<AxiosResponse<any, any>> {
    return this.instance({
      method: 'get',
      url: GET_USER_EMAIL_URL,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}
