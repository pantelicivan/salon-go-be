import { Injectable } from '@nestjs/common';

// Services
import {
  AppleProvider,
  FacebookProvider,
  GoogleProvider,
  GitHubProvider,
  LinkedInProvider,
  SocialAuthProvider,
} from './providers';
import { AuthService } from '../auth.service';

// Entities
import { Account } from '../../../../database/entities';

// Repositories
import {
  AccountRepository,
  ExternalIdRepository,
  RoleRepository,
} from '../../../../database/repositories';

// Contracts
import { AdditionalUserData, SocialUser } from '../../contracts/auth.contracts';

// Static
import { SocialProviders, RoleKeyEnum } from '../../static/auth.static';

// Async results
import {
  AsyncResult,
  Error,
  isErr,
  Success,
} from '../../../../infrastructure/core/results/errors/result';

// Errors
import {
  InvalidSocialAuthToken,
  UnsupportedSocialProvider,
} from '../../static/results/auth.errors';
import { EntityNotFound } from '../../../../common/static/results/application.errors';

// Utils
import { isEmpty } from '../../../../common/utils';

@Injectable()
export class SocialAuthService {
  private provider: SocialAuthProvider;
  private socialUser: SocialUser;

  private availableProviders = {};

  constructor(
    private accountRepository: AccountRepository,
    private externalIdRepository: ExternalIdRepository,
    private roleRepository: RoleRepository,

    private authService: AuthService,

    facebookProvider: FacebookProvider,
    googleProvider: GoogleProvider,
    appleProvider: AppleProvider,
    gitHubProvider: GitHubProvider,
    linkedInProvider: LinkedInProvider,
  ) {
    this.availableProviders[SocialProviders.FACEBOOK] = facebookProvider;
    this.availableProviders[SocialProviders.GOOGLE] = googleProvider;
    this.availableProviders[SocialProviders.APPLE] = appleProvider;
    this.availableProviders[SocialProviders.GITHUB] = gitHubProvider;
    this.availableProviders[SocialProviders.LINKEDIN] = linkedInProvider;
  }

  /**
   * Authenticates an account by social provider.
   * Side effects:
   * 1. Creates account entity if one doesn't exist with the social account's email.
   *    1.a Creates user entity related to the account
   * 2. Creates external id entity as a connection between the application's and social account.
   * @param token - Social provider's token.
   * @param provider - Social provider.
   * @param additionalUserData - Additional user data that can only be retrieved from frontend platforms.
   * @returns The created account.
   * @throws {UnsupportedSocialProvider} - Social provider is not supported.
   * @throws {InvalidSocialAuthToken} - Social auth token is invalid.
   * @throws {EntityNotFound} - Role not found.
   */
  async authenticateAccount(
    token: string,
    provider: string,
    additionalUserData: AdditionalUserData | null = null,
  ): AsyncResult<
    Account,
    InvalidSocialAuthToken | UnsupportedSocialProvider | EntityNotFound
  > {
    if (!this.availableProviders[provider]) {
      return Error(UnsupportedSocialProvider());
    }
    this.provider = this.availableProviders[provider];

    const getUserResult = await this.provider.getUser(token);
    if (isErr(getUserResult)) {
      return getUserResult;
    }

    this.socialUser = getUserResult.value;

    // Assign additional data.
    if (additionalUserData) {
      if (!isEmpty(additionalUserData.firstName)) {
        this.socialUser.firstName = additionalUserData.firstName;
      }

      if (!isEmpty(additionalUserData.lastName)) {
        this.socialUser.lastName = additionalUserData.lastName;
      }
    }

    const externalId = await this.externalIdRepository.findByOrigin({
      origin: this.socialUser.provider,
      externalId: this.socialUser.externalId,
      modelType: Account.getModelType(),
    });

    let account: Account | null;
    if (externalId && externalId.modelId) {
      account = await this.accountRepository.findById(externalId.modelId);
      if (account) return Success(account);
    }
    const createResults = await this.createNewSocialAccount();
    if (isErr(createResults)) return createResults;

    return Success(createResults.value);
  }

  /**
   * Connects the social user with the application's account.
   * Side effects:
   * 1. Creates account entity if one doesn't exist with the social account's email.
   *    1.a Creates user entity related to the account
   * 2. Creates external id entity as a connection between the application's and social account.
   * @throws {EntityNotFound} - Role not found.
   * @returns The created account.
   */
  private async createNewSocialAccount(): AsyncResult<Account, EntityNotFound> {
    let account = await this.accountRepository.findByEmail(
      this.socialUser.email,
    );

    if (!account) {
      const role = await this.roleRepository.findByKey(RoleKeyEnum.CLIENT);
      if (!role) {
        return Error(EntityNotFound('Role'));
      }

      account = await this.authService.registerAccount({
        email: this.socialUser.email,
        roleId: role.id,
        emailVerifiedAt: new Date(),
        firstName: this.socialUser.firstName,
        lastName: this.socialUser.lastName,
      });
    }

    await this.externalIdRepository.create({
      externalId: this.socialUser.externalId,
      origin: this.socialUser.provider,
      modelType: Account.getModelType(),
      modelId: account.id,
    });
    return Success(account);
  }
}
