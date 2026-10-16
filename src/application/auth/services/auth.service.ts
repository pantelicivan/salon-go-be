import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

// Entities
import {
  Account,
  Role,
  EmailVerification,
  PasswordReset,
} from '../../../database/entities';

// Repositories
import {
  AccountRepository,
  AccessTokenRepository,
  EmailVerificationRepository,
  RefreshTokenRepository,
  PasswordResetRepository,
  RoleRepository,
  UserRepository,
} from '../../../database/repositories';

// Services
import { EmailService } from '../../../features/email/email.service';

// Contracts
import {
  AuthTokens,
  AccountRegistrationData,
  RegisterAccountPayload,
  JwtPayload,
} from '../contracts/auth.contracts';

// Static
import { RoleKeyEnum } from '../static/auth.static';

// Async results
import {
  AsyncResult,
  Error,
  Success,
} from '../../../infrastructure/core/results/errors/result';

// Errors
import {
  EntityAlreadyExists,
  EntityNotFound,
} from '../../../common/static/results/application.errors';
import {
  InvalidEmailVerificationToken,
  InvalidRefreshToken,
  WrongCredentials,
  ResetPasswordFailed,
} from '../static/results/auth.errors';
import { EmailFailed } from '../../../features/email/static/results/email.errors';

// Utils
import { isEmpty } from '../../../common/utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly accessTokenRepository: AccessTokenRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly emailVerificationRepository: EmailVerificationRepository,
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly roleRepository: RoleRepository,
    private readonly userRepository: UserRepository,

    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  /**
   * Registers an account.
   * Side effects:
   * 1. Creates user entity related to the account.
   * @param data - Registration data.
   * @returns The created account
   * @throws {UserAlreadyExists} - Email conflict.
   * @throws {EntityNotFound} - Role not found.
   */
  async register(
    data: RegisterAccountPayload,
  ): AsyncResult<Account, EntityAlreadyExists | EntityNotFound> {
    let account = await this.accountRepository.findByEmail(data.email);
    if (!isEmpty(account)) {
      return Error(EntityAlreadyExists('User'));
    }

    const [{ salt, passwordHash }, role] = await Promise.all([
      Account.hashPassword(data.password),
      this.roleRepository.findByKey(RoleKeyEnum.CLIENT),
    ]);
    if (!role) {
      return Error(EntityNotFound('Role'));
    }

    account = await this.registerAccount({
      email: data.email,
      salt,
      password: passwordHash,
      roleId: role.id,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    return Success(account);
  }

  /**
   * Registers an account.
   * Side effects:
   * 1. Creates account's user relation
   * @param data - Account registration data.
   * @returns The created account.
   */
  async registerAccount(data: AccountRegistrationData): Promise<Account> {
    // Create the account entity.
    const account = await this.accountRepository.create({
      email: data.email,
      salt: data.salt,
      password: data.password,
      roleId: data.roleId,
    });

    // Create the user entity.
    const user = await this.userRepository.create({
      accountId: account.id,
      email: account.email,
      firstName: data.firstName,
      lastName: data.lastName,
    });
    account.setUser(user);
    return account;
  }

  /**
   * Finds account with the given email and password.
   * @param email - Account's email.
   * @param password - Account's password.
   * @throws {WrongCredentials} - Credentials are incorrect.
   */
  async authenticateAccount(
    email: string,
    password: string,
  ): Promise<Account | null> {
    const account = await this.accountRepository.findWithCredentials(email);
    if (!account || !(await this.isAccountPasswordValid(account, password))) {
      return null;
    }
    return account;
  }

  /**
   * Logs the account in.
   * @param email - Account's email.
   * @param password - Account's password.
   * @returns Auth tokens - Set of OAuth and Bearer tokens.
   * @throws {WrongCredentials} - Credentials are incorrect.
   */
  async login(
    email: string,
    password: string,
  ): AsyncResult<AuthTokens, WrongCredentials> {
    const account = await this.authenticateAccount(email, password);
    if (!account) {
      return Error(WrongCredentials());
    }

    return Success(await this.generateTokens(account));
  }

  /**
   * Generates OAuth and Bearer tokens for the given account.
   * @param account: Account
   * @return {AuthTokens} - Generated OAuth and Bearer tokens.
   */
  async generateTokens(account: Account): Promise<AuthTokens> {
    const accessToken =
      await this.accessTokenRepository.createAccessToken(account);
    const refreshToken =
      await this.refreshTokenRepository.createRefreshToken(accessToken);

    const oAuthTokens = { accessToken, refreshToken };

    const bearerTokens = {
      accessToken: this.jwtService.sign({
        jti: accessToken.id,
        sub: account.id as string,
      }),
      refreshToken: this.jwtService.sign({
        jti: refreshToken.id,
        sub: accessToken.id as string,
      }),
    };

    return { oAuthTokens, bearerTokens };
  }

  /**
   * Validates if the given password is indeed the account's password.
   * @param {Account} account - Account instance.
   * @param {string} password - Password to validate.
   * @returns boolean - Is password valid.
   */
  async isAccountPasswordValid(
    account: Account,
    password: string,
  ): Promise<boolean> {
    const passwordHash = await bcrypt.hash(password, account.salt || 1);
    return passwordHash === account.password;
  }

  /**
   * Refreshes the authorization tokens.
   * @param token - Encoded bearer refresh token.
   * @returns {AuthTokens} - Auth tokens.
   * @throws {InvalidRefreshToken} - Refresh token invalid.
   */
  async refreshTokens(
    token: string,
  ): AsyncResult<AuthTokens, InvalidRefreshToken> {
    const bearerToken = this.jwtService.decode(token) as JwtPayload;

    if (!bearerToken) {
      return Error(InvalidRefreshToken());
    }

    const refreshToken = await this.refreshTokenRepository.findValidById(
      bearerToken.jti,
    );
    if (
      !refreshToken ||
      !refreshToken.accessToken ||
      !refreshToken.accessToken.account
    ) {
      return Error(InvalidRefreshToken());
    }

    await this.accessTokenRepository.delete({ id: refreshToken.accessTokenId });
    return Success(await this.generateTokens(refreshToken.accessToken.account));
  }

  /**
   * Finds a valid email verification for the given account.
   * Email verification is valid if it is not expired and not used.
   * Search can be limited to a single token.
   * @param account - Account entity.
   * @param token - Email verification token.
   * @returns Email verification if found.
   */
  findEmailVerificationForAccount(
    account: Account,
    token?: string,
  ): Promise<boolean> {
    return this.emailVerificationRepository.existsForAccount(account, token);
  }

  /**
   * Generates email verification for the given account.
   * @param {Account} account - Account instance.
   * @returns {EmailVerification}
   */
  generateEmailVerification(account: Account): Promise<EmailVerification> {
    return this.emailVerificationRepository.create({ accountId: account.id });
  }

  /**
   * Sends email with an email verification token to the provided account.
   * @param {Account} account - Account instance.
   * @param {EmailVerification} emailVerification - Email verification instance.
   */
  sendVerificationEmail(
    account: Account,
    emailVerification: EmailVerification,
  ): AsyncResult<boolean, EmailFailed> {
    return this.emailService.sendEmail({
      to: account.email,
      subject: 'Verify Email',
      template: './verify_email',
      context: {
        subject: 'Verify Email',
        token: emailVerification.id,
      },
    });
  }

  /**
   * @param email - Email
   * @returns A boolean indicating if the email has already been taken.
   */
  async isEmailTaken(email: string): Promise<boolean> {
    return this.accountRepository.existWithEmail(email);
  }

  /**
   * Verifies account's email with the provided email verification token.
   * @param {Account} account - Account instance
   * @param {string} token - Email verification token
   * @returns Success || Error - Token invalid.
   */
  async verifyEmail(
    account: Account,
    token: string,
  ): AsyncResult<void, InvalidEmailVerificationToken> {
    const exists = await this.emailVerificationRepository.existsForAccount(
      account,
      token,
    );
    if (!exists) {
      return Error(InvalidEmailVerificationToken());
    }

    await Promise.all([
      this.accountRepository.updateEntity(account, {
        emailVerifiedAt: new Date(),
      }),
      this.emailVerificationRepository.delete({
        id: token,
      }),
    ]);
    return Success();
  }

  /**
   * Changes the given account's password.
   * @param {Account} account - Account instance.
   * @param {string} password - New password string.
   */
  async changeAccountPassword(
    account: Account,
    password: string,
  ): Promise<void> {
    const { salt, passwordHash } = await Account.hashPassword(password);
    await this.accountRepository.updateEntity(account, {
      salt,
      password: passwordHash,
    });
  }

  /**
   * Finds a valid password reset for the given account.
   * Password reset is valid if it is not expired and not used.
   * Search can be limited to a single token.
   * @param account - Account entity.
   * @param token - Password reset token.
   * @returns Boolean indicating if the password rest exists.
   */
  findPasswordResetForAccount(
    account: Account,
    token?: string,
  ): Promise<boolean> {
    return this.passwordResetRepository.existsForAccount(account, token);
  }

  /**
   * Generates a password reset for the given account.
   * @param {Account} account - Account instance.
   * @returns {PasswordReset}
   */
  generatePasswordReset(account: Account): Promise<PasswordReset> {
    return this.passwordResetRepository.create({ accountId: account.id });
  }

  /**
   * Creates reset password token and sends reset password email to the provided account.
   * @param account - Account instance.
   * @param passwordReset - Password reset instance.
   * @returns Boolean of success or email error.
   */
  sendForgotPasswordEmail(
    account: Account,
    passwordReset: PasswordReset,
  ): AsyncResult<boolean, EmailFailed> {
    return this.emailService.sendEmail({
      to: account.email,
      subject: 'Password Reset',
      template: './reset_password',
      context: {
        subject: 'Password Reset',
        token: passwordReset.id,
      },
    });
  }

  /**
   * Resets account's password based on password reset token.
   * @param {string} token - Reset password token.
   * @param {string} password - New password.
   * @returns Success bool or appropriate error.
   */
  async resetPassword(
    token: string,
    password: string,
  ): AsyncResult<boolean, ResetPasswordFailed> {
    const passwordReset = await this.passwordResetRepository.findValid(token);

    if (!passwordReset || !passwordReset.account) {
      return Error(ResetPasswordFailed());
    }

    await Promise.all([
      this.changeAccountPassword(passwordReset.account, password),
      this.passwordResetRepository.delete({ id: token }),
    ]);
    return Success(true);
  }

  /**
   * Returns roles from database.
   * @returns Roles
   */
  getRoles(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  /**
   * Logouts the given account by deleting its currently authenticated token.
   * Will cascade delete the related refresh token.
   * @param account - Account entity.
   * @returns Boolean indicating if the logout has been successful.
   */
  async logout(account: Account): Promise<boolean> {
    const authToken = account.getCurrentAuthToken();
    if (!authToken) return false;
    return this.accessTokenRepository.delete({ id: authToken.id });
  }
}
