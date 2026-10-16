import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

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

const GOOGLE_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

@Injectable()
export class GoogleProvider implements SocialAuthProvider {
  private instance: AxiosInstance;
  private response: SocialUserResponse & { id: string; email: string };

  constructor() {
    this.instance = axios.create({ baseURL: GOOGLE_URL });
  }

  async getUser(
    token: string,
  ): AsyncResult<SocialUser, InvalidSocialAuthToken> {
    try {
      const user = this.instance({
        method: 'get',
        headers: { Authorization: `Bearer ${token}` },
      });
      this.response = { ...(await user).data };
      return Success(this.toSocialUser());
    } catch (err) {
      return Error(InvalidSocialAuthToken());
    }
  }

  toSocialUser(): SocialUser {
    return {
      provider: SocialProviders.GOOGLE,
      externalId: this.response.id,
      email: this.response.email,
      firstName: this.response.given_name,
      lastName: this.response.family_name,
    };
  }
}
