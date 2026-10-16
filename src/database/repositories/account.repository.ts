import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { Account } from '../entities';

// Repositories
import { BaseRepository } from './base.repository';

@Injectable()
export class AccountRepository extends BaseRepository<Account> {
  protected alias: string;

  constructor(
    @InjectRepository(Account)
    protected repo: Repository<Account>,
  ) {
    super(repo);
    this.alias = 'account';
  }

  /**
   * Finds account by id.
   * Loads the following relations:
   * - User
   * @param {string} id
   * @returns Account if found.
   */
  findById(id: string): Promise<Account | null> {
    return this.qb()
      .leftJoinAndSelect(`${this.alias}.user`, 'user')
      .where(`${this.alias}.id = :id`, { id })
      .getOne();
  }

  /**
   * Finds account by email.
   * Loads the following relations:
   * - User
   * @param {string} email
   * @returns Account if found.
   */
  findByEmail(email: string): Promise<Account | null> {
    return this.qb()
      .leftJoinAndSelect(`${this.alias}.user`, 'user')
      .where(`${this.alias}.email = :email`, { email })
      .getOne();
  }

  /**
   * Finds an account by email with credentials loaded.
   * Loads the following relations:
   * - User
   * @param {string} email
   * @returns Account if found.
   */
  findWithCredentials(email: string): Promise<Account | null> {
    return (
      this.qb()
        // Salt and password are not loaded by default
        .addSelect(`${this.alias}.salt`)
        .addSelect(`${this.alias}.password`)
        .leftJoinAndSelect(`${this.alias}.user`, 'user')
        .where(`${this.alias}.email = :email`, { email })
        .getOne()
    );
  }

  /**
   * @param email - Email
   * @returns A boolean indicating account with passed email exists.
   */
  existWithEmail(email: string): Promise<boolean> {
    return this.exists('email = $1', [email]);
  }
}
