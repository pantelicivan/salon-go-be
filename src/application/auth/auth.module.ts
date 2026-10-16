import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

// Modules
import { ConfigModule } from '../../infrastructure/config/config.module';
import { EmailModule } from '../../features/email/email.module';
import { AccountModule } from '../account/account.module';
import { UserModule } from '../user/user.module';

// Controllers
import { AuthController } from './auth.controller';

// Services
import { ConfigService } from '../../infrastructure/config/config.service';
import { AuthService } from './services/auth.service';
import { SocialAuthService } from './services/social-auth/social-auth.service';
import { AuthCrons } from './services/auth.crons';

// Providers
import {
  AppleProvider,
  FacebookProvider,
  GoogleProvider,
  GitHubProvider,
  LinkedInProvider,
} from './services/social-auth/providers';
import { JwtStrategy } from './strategies/jwt.strategy';

// Entities
import {
  Account,
  User,
  ExternalId,
  OAuthAccessToken,
  OAuthRefreshToken,
  EmailVerification,
  PasswordReset,
  Role,
} from '../../database/entities';

// Repositories
import {
  AccessTokenRepository,
  EmailVerificationRepository,
  ExternalIdRepository,
  RefreshTokenRepository,
  PasswordResetRepository,
  RoleRepository,
} from '../../database/repositories';

// Guards
import { RolesGuard } from '../../infrastructure/core/guards/role.guard';

// Static
import { JWT_EXP_TIME_IN_SECONDS } from './static/auth.static';

@Module({
  imports: [
    // Database
    TypeOrmModule.forFeature([
      Account,
      User,
      ExternalId,
      OAuthAccessToken,
      OAuthRefreshToken,
      EmailVerification,
      PasswordReset,
      Role,
    ]),
    // Auth
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: JWT_EXP_TIME_IN_SECONDS,
        },
      }),
      inject: [ConfigService],
    }),
    // Infrastructure
    ConfigModule,
    EmailModule,
    // Domain modules
    AccountModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    RolesGuard,
    AuthService,
    SocialAuthService,
    AppleProvider,
    FacebookProvider,
    GoogleProvider,
    GitHubProvider,
    LinkedInProvider,
    AuthCrons,
    ExternalIdRepository,
    AccessTokenRepository,
    RefreshTokenRepository,
    EmailVerificationRepository,
    PasswordResetRepository,
    RoleRepository,
  ],
  exports: [AuthService],
})
export class AuthModule {}
