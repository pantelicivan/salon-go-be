import {
  Controller,
  Post,
  Body,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Get,
  HttpCode,
  UseGuards,
  Patch,
  Delete,
  Query,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Transactional } from 'typeorm-transactional';

// Services
import { AuthService } from './services/auth.service';
import { AccountService } from '../account/account.service';
import { SocialAuthService } from './services/social-auth/social-auth.service';
import { UserService } from '../user/user.service';

// Entities
import { Account } from '../../database/entities';

// Guards
import { JwtAuthGuard } from '../../infrastructure/core/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/core/guards/role.guard';

// Decorators
import { Roles } from '../../infrastructure/core/decorators/api/role.decorator';
import { GetAuthAccount } from '../../infrastructure/core/decorators/api/get-auth-account.decorator';

// Filters
import { HttpExceptionDTO } from '../../infrastructure/core/filters/exception/dtos/res/http-exception.dto';

// Contracts
import { AdditionalUserData } from './contracts/auth.contracts';

// Static
import { RoleKeyEnum } from './static/auth.static';

// Request DTOs
import {
  ChangePasswordRequestDTO,
  EmailAvailableRequestDTO,
  ForgotPasswordRequestDTO,
  LoginRequestDTO,
  RefreshTokenRequestDTO,
  RegistrationRequestDTO,
  ResetPasswordRequestDTO,
  SocialAuthRequestDTO,
} from './dtos/req';
import { VerifyEmailRequestDTO } from './dtos/req/verify-email.dto';
import { UpdateUserRequestDTO } from './dtos/req/update-user.dto';

// Response DTOs
import { AuthResponseDTO, AuthUserResponseDTO } from './dtos/res/auth.dto';

// Async results
import { isErr } from '../../infrastructure/core/results/errors/result';

// Errors
import {
  EntityAlreadyExists,
  EntityNotFound,
  MissingRelation,
  NothingToUpdate,
} from '../../common/static/results/application.errors';
import {
  InvalidSocialAuthToken,
  UnsupportedSocialProvider,
  ResetPasswordFailed,
  ResetAlreadySent,
  SocialAuthenticationFailed,
  EmailAlreadyVerified,
  EmailVerificationAlreadySent,
  EmailVerificationFailed,
  WrongCredentials,
  EmailAlreadyTaken,
} from './static/results/auth.errors';

// Utils
import { isEmpty } from '../../common/utils';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private socialAuthService: SocialAuthService,
    private userService: UserService,
  ) {}

  /**
   * Demo function.
   * Purpose: Demonstrating how to user Role guards.
   * @returns {string}
   */
  @Get('admin')
  @Roles(RoleKeyEnum.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  admin(): string {
    return 'Hello admin!';
  }

  /**
   * Demo function.
   * Purpose: Demonstrating how to user Role guards.
   * @returns {string}
   */
  @Get('client')
  @Roles(RoleKeyEnum.CLIENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  client(): string {
    return 'Hello client!';
  }

  /**
   * Registers a new account.
   * Side effects:
   * 1. Creates user entity related to the account.
   * 2. Sends a verification email.
   * @param payload - Registration payload
   * @throws {UserAlreadyExists} - Email conflict.
   * @throws {EntityNotFound} - Role not found.
   * @returns Auth tokens - Set of OAuth and Bearer tokens.
   */
  @Post('/registration')
  @ApiConflictResponse({
    description: 'User already exists.',
    type: HttpExceptionDTO,
  })
  @ApiNotFoundResponse({
    description: 'Role not found.',
    type: HttpExceptionDTO,
  })
  @Transactional()
  async register(
    @Body() payload: RegistrationRequestDTO,
  ): Promise<AuthResponseDTO> {
    const registrationResult = await this.authService.register(payload);
    if (isErr(registrationResult)) {
      switch (registrationResult.error.code) {
        case EntityNotFound().code:
          throw new NotFoundException(registrationResult.error);
        case EntityAlreadyExists().code:
          throw new ConflictException(registrationResult.error);
      }
    }
    const account = registrationResult.value;
    const [authTokens, emailVerification] = await Promise.all([
      this.authService.generateTokens(account),
      this.authService.generateEmailVerification(account),
    ]);

    this.authService.sendVerificationEmail(account, emailVerification);
    return new AuthResponseDTO(authTokens);
  }

  /**
   * Logs the user in.
   * @param payload - Login payload.
   * @throws {WrongCredentials} - Credentials are incorrect.
   * @returns Auth tokens - Set of OAuth and Bearer tokens.
   */
  @Post('/login')
  @ApiBadRequestResponse({
    description: 'Validation failed | Wrong credentials',
    type: HttpExceptionDTO,
  })
  async login(@Body() payload: LoginRequestDTO): Promise<AuthResponseDTO> {
    const loginResult = await this.authService.login(
      payload.email,
      payload.password,
    );
    if (isErr(loginResult)) {
      throw new BadRequestException(loginResult.error);
    }
    const authTokens = loginResult.value;
    return new AuthResponseDTO(authTokens);
  }

  /**
   * Refreshes authorization tokens.
   * @param payload - Refresh tokens payload.
   * @throws {InvalidRefreshToken} - Refresh token invalid.
   * @returns Auth tokens response.
   */
  @Post('/refresh')
  @ApiBadRequestResponse({
    description: 'Invalid refresh token.',
    type: HttpExceptionDTO,
  })
  async refresh(
    @Body() payload: RefreshTokenRequestDTO,
  ): Promise<AuthResponseDTO> {
    const refreshResult = await this.authService.refreshTokens(
      payload.refreshToken,
    );
    if (isErr(refreshResult)) {
      throw new BadRequestException(refreshResult.error);
    }
    return new AuthResponseDTO(refreshResult.value);
  }

  /**
   * Authenticates an account by social provider.
   * Side effects:
   * 1. Creates account entity if one doesn't exist with the social account's email.
   *    1.a Creates user entity related to the account
   * 2. Creates external id entity as a connection between the application's and social account.
   * @param payload - Social authentication payload
   * @throws {UnsupportedSocialProvider} - Social provider is not supported.
   * @throws {InvalidSocialAuthToken} - Social auth token is invalid.
   * @throws {EntityNotFound} - Role not found.
   * @returns Auth tokens - Set of OAuth and Bearer tokens.
   */
  @Post('/social')
  @ApiBadRequestResponse({
    description: `Social authentication failed. | Invalid social auth token | \n
                  Social provider is not supported. | Role not found.`,
    type: HttpExceptionDTO,
  })
  @Transactional()
  async social(
    @Body() payload: SocialAuthRequestDTO,
  ): Promise<AuthResponseDTO> {
    let additionalAccountData: AdditionalUserData | null = null;
    if (!isEmpty(payload.firstName) || !isEmpty(payload.lastName)) {
      additionalAccountData = {
        firstName: payload.firstName,
        lastName: payload.lastName,
      };
    }
    const authenticationResult =
      await this.socialAuthService.authenticateAccount(
        payload.token,
        payload.provider,
        additionalAccountData,
      );
    if (isErr(authenticationResult)) {
      switch (authenticationResult.error.code) {
        case InvalidSocialAuthToken().code:
        case UnsupportedSocialProvider().code:
        case EntityNotFound().code:
          throw new BadRequestException(authenticationResult.error);
        default:
          throw new BadRequestException(SocialAuthenticationFailed());
      }
    }
    return new AuthResponseDTO(
      await this.authService.generateTokens(authenticationResult.value),
    );
  }

  /**
   * Changes the password of the currently authenticated user.
   * @param authAccount - Currently authenticated user.
   * @param payload - Change password payload.
   * @throws {UnauthorizedException} - Password verification did not pass.
   */
  @Post('/password/change')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiBadRequestResponse({
    description: 'Password change failed.',
    type: HttpExceptionDTO,
  })
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @GetAuthAccount() authAccount: Account,
    @Body() payload: ChangePasswordRequestDTO,
  ): Promise<void> {
    const account = await this.authService.authenticateAccount(
      authAccount.email,
      payload.oldPassword,
    );
    if (!account) {
      throw new BadRequestException(WrongCredentials());
    }
    await this.authService.changeAccountPassword(account, payload.password);
  }

  /**
   * Send password reset email to the provided email address.
   * @param {ForgotPasswordRequestDTO} payload - Forgot password payload containing an email.
   * @throws {NotFoundException} - Account not found.
   * @throws {BadRequestException} - Active password reset exists, or email failed to send.
   */
  @Post('/password/forgot')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNotFoundResponse({
    description: 'Account not found.',
    type: HttpExceptionDTO,
  })
  @ApiBadRequestResponse({
    description:
      'Forgot password failed. | Password reset email has already been sent to the account.',
    type: HttpExceptionDTO,
  })
  @Transactional()
  async forgotPassword(
    @Body() payload: ForgotPasswordRequestDTO,
  ): Promise<void> {
    const account = await this.accountService.findAccountByEmail(payload.email);
    if (!account) {
      throw new NotFoundException(EntityNotFound('Account'));
    }

    // Check if there is already an active password reset.
    const exists = await this.authService.findPasswordResetForAccount(account);
    if (exists) {
      throw new BadRequestException(ResetAlreadySent());
    }

    const passwordReset = await this.authService.generatePasswordReset(account);

    // Send the email and handle the error.
    const sendResults = await this.authService.sendForgotPasswordEmail(
      account,
      passwordReset,
    );
    if (isErr(sendResults)) {
      throw new BadRequestException(ResetPasswordFailed());
    }
  }

  /**
   * Resets account's password based on reset password token.
   * @param {ResetPasswordRequestDTO} payload - Reset password payload.
   * @throws {BadRequestException} - Password reset failed.
   */
  @Post('/password/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBadRequestResponse({
    description: 'Password reset failed.',
    type: HttpExceptionDTO,
  })
  async resetPassword(@Body() payload: ResetPasswordRequestDTO): Promise<void> {
    const resetPasswordResult = await this.authService.resetPassword(
      payload.token,
      payload.password,
    );
    if (isErr(resetPasswordResult)) {
      throw new BadRequestException(ResetPasswordFailed());
    }
  }

  /**
   * Verifies if email is available.
   * @param {EmailAvailableRequestDTO} payload - Verify email request.
   * @throws {ConflictException} - Email has already been taken.
   */
  @Get('/email/available')
  @HttpCode(204)
  @ApiConflictResponse({
    description: 'Email has already been taken.',
    type: HttpExceptionDTO,
  })
  async isEmailAvailable(
    @Query() payload: EmailAvailableRequestDTO,
  ): Promise<void> {
    const result = await this.authService.isEmailTaken(payload.email);
    if (result) {
      throw new ConflictException(EmailAlreadyTaken());
    }
  }

  /**
   * Verifies email for the currently authenticated user.
   * @param {VerifyEmailRequestDTO} payload - Verify email request.
   * @param {Account} authAccount - Currently authenticated user.
   * @throws {BadRequestException} - Token invalid or expired
   */
  @Post('/email/verification')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiBadRequestResponse({
    description: 'Email verification failed.',
    type: HttpExceptionDTO,
  })
  @UseGuards(JwtAuthGuard)
  async verifyEmail(
    @Body() payload: VerifyEmailRequestDTO,
    @GetAuthAccount() authAccount: Account,
  ): Promise<void> {
    const result = await this.authService.verifyEmail(
      authAccount,
      payload.token,
    );
    if (isErr(result)) {
      throw new BadRequestException(result.error);
    }
  }

  /**
   * Sends a verification email to the authenticated user.
   * @param {Account} authAccount - Currently authenticated user.
   * @throws {BadRequestException} - Email already verified, or verification already sent.
   */
  @Post('/email/verification/send')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiBadRequestResponse({
    description: 'Email already verified.',
    type: HttpExceptionDTO,
  })
  @UseGuards(JwtAuthGuard)
  @Transactional()
  async sendEmailVerification(
    @GetAuthAccount() authAccount: Account,
  ): Promise<void> {
    if (authAccount.emailVerifiedAt) {
      throw new BadRequestException(EmailAlreadyVerified());
    }

    // Check if there is already an active email verification.
    const exists = await this.authService.findEmailVerificationForAccount(
      authAccount,
    );
    if (exists) {
      throw new BadRequestException(EmailVerificationAlreadySent());
    }

    // Create the email verification
    const emailVerification = await this.authService.generateEmailVerification(
      authAccount,
    );

    // Send the email and handle the error.
    const sendResults = await this.authService.sendVerificationEmail(
      authAccount,
      emailVerification,
    );
    if (isErr(sendResults)) {
      throw new BadRequestException(EmailVerificationFailed());
    }
  }

  /**
   * Logs out the currently authenticated account.
   * @param authAccount - Currently authenticated account.
   */
  @Post('/logout')
  @HttpCode(204)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  logout(@GetAuthAccount() authAccount: Account): void {
    this.authService.logout(authAccount);
  }

  /**
   * Returns the currently authenticated user.
   * @param {Account} authAccount - Currently authenticated user.
   * @throws {BadRequestException} - User relation is missing.
   * @returns Auth user response.
   */
  @Get('/user')
  @ApiBearerAuth()
  @ApiBadRequestResponse({
    description: 'User relation is missing.',
    type: HttpExceptionDTO,
  })
  @UseGuards(JwtAuthGuard)
  getAuthUser(@GetAuthAccount() authAccount: Account): AuthUserResponseDTO {
    if (!authAccount.user) {
      throw new BadRequestException(MissingRelation('User'));
    }
    return new AuthUserResponseDTO(authAccount.user);
  }

  /**
   * Updates the currently authenticated user.
   * @param {Account} authAccount - Currently authenticated user.
   * @param payload - Payload data to update user.
   * @throws {BadRequestException} - User relation is missing.
   * @returns Updated user.
   */
  @Patch('/user')
  @ApiBearerAuth()
  @ApiBadRequestResponse({
    description: 'User relation is missing.',
    type: HttpExceptionDTO,
  })
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @GetAuthAccount() authAccount: Account,
    @Body() payload: UpdateUserRequestDTO,
  ): Promise<AuthUserResponseDTO> {
    if (isEmpty(payload)) {
      throw new BadRequestException(NothingToUpdate());
    }

    if (!authAccount.user) {
      throw new BadRequestException(MissingRelation('User'));
    }

    await this.userService.updateEntity(authAccount.user, payload);

    return new AuthUserResponseDTO(authAccount.user);
  }

  /**
   * Deletes the currently authenticated account and its relations.
   * @param {Account} authAccount - Currently authenticated user.
   */
  @Delete('/user')
  @HttpCode(204)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  deleteAuthUser(@GetAuthAccount() authAccount: Account): void {
    this.accountService.deleteEntity(authAccount);
  }
}
