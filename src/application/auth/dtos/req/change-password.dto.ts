import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { Expose } from 'class-transformer';

// Decorators
import { Match } from '../../../../infrastructure/core/decorators/validation/match.decorator';

// Static
import { MIN_PASSWORD_LENGTH, PASSWORD_REGEX } from '../../static/auth.static';

export class ChangePasswordRequestDTO {
  @IsNotEmpty({
    context: {
      priority: 1,
      translationKey: 'isNotEmpty',
      args: { property: 'Old password' },
    },
  })
  @IsString({
    context: {
      priority: 2,
      translationKey: 'isString',
      args: { property: 'Old password' },
    },
  })
  @Expose({ name: 'old_password' })
  @ApiProperty({ name: 'old_password' })
  readonly oldPassword: string;

  @IsNotEmpty({
    context: {
      priority: 1,
      translationKey: 'isNotEmpty',
      args: { property: 'Password' },
    },
  })
  @IsString({
    context: {
      priority: 2,
      translationKey: 'isString',
      args: { property: 'Password' },
    },
  })
  @MinLength(MIN_PASSWORD_LENGTH, {
    context: {
      priority: 1,
      translationKey: 'minLength',
      args: { property: 'Password', length: MIN_PASSWORD_LENGTH },
    },
  })
  @Matches(PASSWORD_REGEX, undefined, {
    context: {
      priority: 2,
      translationKey: 'isValidPassword',
      args: { property: 'Password' },
    },
  })
  @ApiProperty({ example: 'secretPassword' })
  readonly password: string;

  @IsNotEmpty({
    context: {
      priority: 1,
      translationKey: 'isNotEmpty',
      args: { property: 'Password confirmation' },
    },
  })
  @IsString({
    context: {
      priority: 2,
      translationKey: 'isString',
      args: { property: 'Password confirmation' },
    },
  })
  @Match('password', {
    // Context will not be passed without message.
    message: 'Password confirmation does not match.',
    context: {
      priority: 3,
      translationKey: 'mustMatch',
      args: { property: 'Password confirmation', matchingProperty: 'password' },
    },
  })
  @Expose({ name: 'password_confirmation' })
  @ApiProperty({ name: 'password_confirmation' })
  readonly passwordConfirmation: string;
}
