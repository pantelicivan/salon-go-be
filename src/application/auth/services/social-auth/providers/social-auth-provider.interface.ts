// Contracts
import { SocialUser } from '../../../contracts/auth.contracts';

// Async results
import { AsyncResult } from '../../../../../infrastructure/core/results/errors/result';

// Errors
import { InvalidSocialAuthToken } from '../../../static/results/auth.errors';

export interface SocialAuthProvider {
  getUser(token: string): AsyncResult<SocialUser, InvalidSocialAuthToken>;
  toSocialUser(): SocialUser;
}
