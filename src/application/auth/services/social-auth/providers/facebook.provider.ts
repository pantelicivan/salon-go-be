import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

// Contracts
import {
  SocialUser,
  SocialUserResponse,
} from '../../../contracts/auth.contracts';
import { SocialAuthProvider } from './social-auth-provider.interface';

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

const FACEBOOK_URL = 'https://graph.facebook.com';
const FACEBOOK_URL_USER_INFO =
  '/me?fields=email,name,first_name,last_name&access_token=';

@Injectable()
export class FacebookProvider implements SocialAuthProvider {
  private instance: AxiosInstance;
  private response!: SocialUserResponse & { id: string; email: string };

  constructor() {
    this.instance = axios.create({ baseURL: FACEBOOK_URL });
  }

  async getUser(
    token: string,
  ): AsyncResult<SocialUser, InvalidSocialAuthToken> {
    try {
      const user = this.instance.get(FACEBOOK_URL_USER_INFO + token);
      this.response = { ...(await user).data };
      return Success(this.toSocialUser());
    } catch (err) {
      return Error(InvalidSocialAuthToken());
    }
  }

  toSocialUser(): SocialUser {
    return {
      provider: SocialProviders.FACEBOOK,
      externalId: this.response.id,
      email: this.response.email,
      firstName: this.response.first_name,
      lastName: this.response.last_name,
    };
  }
}
