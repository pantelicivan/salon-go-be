import { Injectable } from '@nestjs/common';

// Services
import { BaseService } from '../base/service/base.service';

// Entities
import { Account, ExternalId } from '../../database/entities';

// Repositories
import {
  AccountRepository,
  ExternalIdRepository,
} from '../../database/repositories';

@Injectable()
export class AccountService extends BaseService<Account> {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly externalIdRepository: ExternalIdRepository,
  ) {
    super(accountRepository);
  }

  /**
   * Finds account by id.
   * @param {string} id
   * @returns {Account | null}
   */
  findAccountById(id: string): Promise<Account | null> {
    return this.accountRepository.findById(id);
  }

  /**
   * Finds account by email.
   * @param {string} email
   * @returns {Account | null}
   */
  findAccountByEmail(email: string): Promise<Account | null> {
    return this.accountRepository.findByEmail(email);
  }

  /**
   * Returns the given's account external id that suits the given origin.
   * @param account - The given account entity.
   * @param origin - External id's origin.
   * @returns {ExternalId | null} - Found external id.
   */
  getAccountExternalId(
    account: Account,
    origin: string,
  ): Promise<ExternalId | null> {
    return this.externalIdRepository.findOne({
      modelType: Account.name,
      modelId: account.id,
      origin: origin,
    });
  }
}
